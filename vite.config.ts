import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { chromium } from "@playwright/test";

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
        async function readJsonBody(req: any): Promise<any> {
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

        server.middlewares.use(async (req, res, next) => {
          try {
            if (!req.url) return next();

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
              const pdfDir = path.resolve(__dirname, "generated/pdfs");
              await fs.mkdir(jobsDir, { recursive: true });
              await fs.mkdir(pdfDir, { recursive: true });
              await fs.writeFile(
                path.resolve(jobsDir, `${jobId}.json`),
                JSON.stringify(payload, null, 2),
                "utf8"
              );

              const baseUrl = `http://localhost:${server.config.server.port ?? 8080}`;
              const browser = await chromium.launch();
              try {
                const page = await browser.newPage();
                await page.goto(`${baseUrl}/print?jobId=${encodeURIComponent(jobId)}`, {
                  waitUntil: "domcontentloaded",
                });
                await page.waitForFunction(() => (window as any).__GG_PRINT_READY === true, null, {
                  timeout: 20_000,
                });

                const pdfPath = path.resolve(pdfDir, `${jobId}.pdf`);
                await page.pdf({
                  path: pdfPath,
                  format: "A4",
                  landscape: true,
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
              } finally {
                await browser.close();
              }
              return;
            }

            return next();
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "pdf_backend_error", message: e?.message ?? String(e) }));
          }
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
