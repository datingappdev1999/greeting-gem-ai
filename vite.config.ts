import { defineConfig } from "vite";
import type { Connect } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import { chromium } from "@playwright/test";
import Stripe from "stripe";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
              const jobsDir = path.resolve(__dirname, "generated/pdf-jobs");
              const pdfDir = path.resolve(__dirname, "generated");
              await fs.mkdir(jobsDir, { recursive: true });
              await fs.mkdir(pdfDir, { recursive: true });
              await fs.writeFile(
                path.resolve(jobsDir, `${jobId}.json`),
                JSON.stringify(payload, null, 2),
                "utf8"
              );

              // Use the actual runtime dev URL (port can auto-increment when 8080 is occupied).
              const runtimeLocalUrl = server.resolvedUrls?.local?.[0]?.replace(/\/$/, "");
              const baseUrl =
                runtimeLocalUrl ?? `http://127.0.0.1:${server.config.server.port ?? 8080}`;
              const browser = await chromium.launch();
              try {
                const page = await browser.newPage();
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

                const pdfPath = path.resolve(pdfDir, `${jobId}.pdf`);
                await page.pdf({
                  path: pdfPath,
                  format: "A4",
                  landscape: true,
                  preferCSSPageSize: true,
                  printBackground: true,
                  margin: { top: "0", right: "0", bottom: "0", left: "0" },
                });

                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    jobId,
                    pdfPath,
                  })
                );
                console.log(`[pdf:${jobId}] generated ${pdfPath}`);
              } finally {
                await browser.close();
              }
              return;
            }

            if (req.method === "POST" && req.url === "/api/create-checkout-session") {
              const payload = await readJsonBody(req);
              const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
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
}));
