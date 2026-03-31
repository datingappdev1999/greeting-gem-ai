import { defineConfig, loadEnv } from "vite";
import type { Connect } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import { chromium } from "@playwright/test";
import type { Browser } from "@playwright/test";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import Stripe from "stripe";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const readServerEnv = (name: string): string | undefined => process.env[name] ?? env[name];

  return ({
  server: {
    host: "127.0.0.1",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: "gg-pdf-backend",
      configureServer(server) {
        // Dev-only: serve user-provided "easter ...2" background textures from Cursor assets.
        // Keeps the landing/preview images unchanged while customizing uses the "2" templates.
        const easter2AssetsBase = path.resolve(
          __dirname,
          "..",
          ".cursor",
          "projects",
          "Users-alexandermcfadzean-greeting-gem-ai",
          "assets"
        );

        async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
          return new Promise((resolve, reject) => {
            let data = "";
            req.on("data", (chunk: Buffer) => {
              data += chunk.toString("utf8");
            });
            req.on("end", () => {
              try {
                resolve(data ? JSON.parse(data) : {});
              } catch (e) {
                reject(e);
              }
            });
            req.on("error", reject);
          });
        }

        function getRequiredEnv(name: string): string {
          const value = readServerEnv(name);
          if (!value) {
            throw new Error(`Missing required environment variable: ${name}`);
          }
          return value;
        }

        let browserPromise: Promise<Browser> | null = null;
        let s3Client: S3Client | null = null;

        function getS3Client(): S3Client {
          if (s3Client) return s3Client;
          const s3Region = readServerEnv("S3_REGION") ?? "lon1";
          const s3Endpoint = getRequiredEnv("S3_ENDPOINT");
          const s3AccessKeyId = getRequiredEnv("S3_ACCESS_KEY_ID");
          const s3SecretAccessKey = getRequiredEnv("S3_SECRET_ACCESS_KEY");
          s3Client = new S3Client({
            region: s3Region,
            endpoint: s3Endpoint,
            forcePathStyle: false,
            credentials: {
              accessKeyId: s3AccessKeyId,
              secretAccessKey: s3SecretAccessKey,
            },
          });
          return s3Client;
        }

        async function getBrowser(): Promise<Browser> {
          if (!browserPromise) {
            browserPromise = chromium.launch().catch((err) => {
              browserPromise = null;
              throw err;
            });
          }
          const browser = await browserPromise;
          if (!browser.isConnected()) {
            browserPromise = null;
            return getBrowser();
          }
          return browser;
        }

        server.httpServer?.once("close", async () => {
          if (!browserPromise) return;
          try {
            const browser = await browserPromise;
            if (browser.isConnected()) {
              await browser.close();
            }
          } catch {
            // ignore shutdown cleanup failures
          } finally {
            browserPromise = null;
          }
        });

        const middleware: Connect.NextHandleFunction = async (req, res, next) => {
          try {
            if (!req.url) return next();

            if (req.method === "GET" && req.url.startsWith("/easter2/")) {
              const raw = req.url.split("/easter2/")[1]?.split("?")[0] ?? "";
              const safeName = path.basename(decodeURIComponent(raw));
              const filePath = path.resolve(easter2AssetsBase, safeName);
              if (existsSync(filePath)) {
                const buf = await fs.readFile(filePath);
                res.setHeader("Content-Type", "image/png");
                res.end(buf);
                return;
              }
            }

            if (req.method === "GET" && req.url.startsWith("/api/pdf-job/")) {
              const jobId = decodeURIComponent(req.url.split("/api/pdf-job/")[1] ?? "");
              const jobPath = path.resolve(__dirname, "generated/pdf-jobs", `${jobId}.json`);
              if (!existsSync(jobPath)) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: "not_found" }));
                return;
              }
              const json = await fs.readFile(jobPath, "utf8");
              res.setHeader("Content-Type", "application/json");
              res.end(json);
              return;
            }

            if (req.method === "POST" && req.url === "/api/render-pdf") {
              const payload = await readJsonBody(req);
              const jobId = randomUUID();
              const startedAt = Date.now();
              const jobsDir = path.resolve(__dirname, "generated/pdf-jobs");
              await fs.mkdir(jobsDir, { recursive: true });
              await fs.writeFile(
                path.resolve(jobsDir, `${jobId}.json`),
                JSON.stringify(payload, null, 2),
                "utf8"
              );

              // Use the actual runtime dev URL (port can auto-increment when 8080 is occupied).
              const runtimeLocalUrl = server.resolvedUrls?.local?.[0]?.replace(/\/$/, "");
              const baseUrl =
                runtimeLocalUrl ?? `http://127.0.0.1:${server.config.server.port ?? 8080}`;
              const browser = await getBrowser();
              const page = await browser.newPage();
              try {
                page.on("console", (msg) => {
                  if (msg.type() === "error") {
                    console.error(`[pdf:${jobId}] page console error: ${msg.text()}`);
                  }
                });
                page.on("pageerror", (err) => {
                  console.error(`[pdf:${jobId}] page error: ${err.message}`);
                });
                await page.goto(`${baseUrl}/print?jobId=${encodeURIComponent(jobId)}`, {
                  waitUntil: "domcontentloaded",
                });
                await page.waitForFunction(() => (window as Window & { __GG_PRINT_READY?: boolean }).__GG_PRINT_READY === true, null, {
                  timeout: 90_000,
                });

                const s3Bucket = readServerEnv("S3_BUCKET") ?? "customer-uploads";
                const s3KeyPrefix = ((readServerEnv("S3_KEY_PREFIX") ?? "customer-uploads")).replace(
                  /^\/+|\/+$/g,
                  ""
                );
                const pdfBuffer = await page.pdf({
                  format: "A4",
                  landscape: true,
                  preferCSSPageSize: true,
                  printBackground: true,
                  margin: { top: "0", right: "0", bottom: "0", left: "0" },
                });

                const key = `${s3KeyPrefix}/pdf/${jobId}.pdf`;
                await getS3Client().send(
                  new PutObjectCommand({
                    Bucket: s3Bucket,
                    Key: key,
                    Body: pdfBuffer,
                    ContentType: "application/pdf",
                  })
                );

                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    jobId,
                    pdfPath: `s3://${s3Bucket}/${key}`,
                  })
                );
                console.log(
                  `[pdf:${jobId}] generated and uploaded to s3://${s3Bucket}/${key} in ${Date.now() - startedAt}ms`
                );
              } finally {
                await page.close();
              }
              return;
            }

            if (req.method === "POST" && req.url === "/api/create-checkout-session") {
              const payload = await readJsonBody(req);
              const stripeSecretKey = readServerEnv("STRIPE_SECRET_KEY");
              if (!stripeSecretKey) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error: "stripe_not_configured",
                    message: "Missing STRIPE_SECRET_KEY.",
                  })
                );
                return;
              }

              const stripe = new Stripe(stripeSecretKey, {
                apiVersion: "2025-02-24.acacia",
              });

              const host = req.headers.host;
              if (!host) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "missing_host_header" }));
                return;
              }
              const protocol = (req.headers["x-forwarded-proto"] as string) || "http";
              const origin = `${protocol}://${host}`;

              const session = await stripe.checkout.sessions.create({
                mode: "payment",
                line_items: [
                  {
                    price_data: {
                      currency: "gbp",
                      unit_amount: 559,
                      product_data: {
                        name: "Personalised greeting card",
                      },
                    },
                    quantity: 1,
                  },
                ],
                success_url: `${origin}/post-checkout?success=true`,
                cancel_url: `${origin}/checkout?canceled=true`,
                automatic_tax: { enabled: true },
                metadata: {
                  templateId: String(payload.templateId ?? ""),
                  pdfPath: String(payload.pdfPath ?? ""),
                  shippingName: String((payload.shippingAddress as Record<string, unknown> | undefined)?.name ?? ""),
                  shippingLine1: String((payload.shippingAddress as Record<string, unknown> | undefined)?.line1 ?? ""),
                  shippingLine2: String((payload.shippingAddress as Record<string, unknown> | undefined)?.line2 ?? ""),
                  shippingCity: String((payload.shippingAddress as Record<string, unknown> | undefined)?.city ?? ""),
                  shippingPostcode: String((payload.shippingAddress as Record<string, unknown> | undefined)?.postcode ?? ""),
                  shippingCountry: String((payload.shippingAddress as Record<string, unknown> | undefined)?.country ?? ""),
                },
              });

              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  url: session.url,
                })
              );
              return;
            }

            return next();
          } catch (e: unknown) {
            const rawMessage = e instanceof Error ? e.message : String(e);
            const message = /Executable doesn't exist|playwright install/i.test(rawMessage)
              ? "Chromium is not installed for Playwright. Run: npx playwright install chromium"
              : rawMessage;
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "pdf_backend_error", message }));
          }
        };
        server.middlewares.use(middleware);
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  });
});
