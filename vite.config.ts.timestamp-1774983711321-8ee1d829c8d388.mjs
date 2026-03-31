// vite.config.ts
import { defineConfig } from "file:///Users/alexandermcfadzean/greeting-gem-ai/node_modules/vite/dist/node/index.js";
import react from "file:///Users/alexandermcfadzean/greeting-gem-ai/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///Users/alexandermcfadzean/greeting-gem-ai/node_modules/lovable-tagger/dist/index.js";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { chromium } from "file:///Users/alexandermcfadzean/greeting-gem-ai/node_modules/@playwright/test/index.mjs";
var __vite_injected_original_dirname = "/Users/alexandermcfadzean/greeting-gem-ai";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 8080,
    hmr: {
      overlay: false
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: "gg-pdf-backend",
      configureServer(server) {
        const easter2AssetsBase = path.resolve(
          __vite_injected_original_dirname,
          "..",
          ".cursor",
          "projects",
          "Users-alexandermcfadzean-greeting-gem-ai",
          "assets"
        );
        async function readJsonBody(req) {
          return new Promise((resolve, reject) => {
            let data = "";
            req.on("data", (chunk) => {
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
        const middleware = async (req, res, next) => {
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
              const jobPath = path.resolve(__vite_injected_original_dirname, "generated/pdf-jobs", `${jobId}.json`);
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
              const jobsDir = path.resolve(__vite_injected_original_dirname, "generated/pdf-jobs");
              const pdfDir = path.resolve(__vite_injected_original_dirname, "generated/pdfs");
              await fs.mkdir(jobsDir, { recursive: true });
              await fs.mkdir(pdfDir, { recursive: true });
              await fs.writeFile(
                path.resolve(jobsDir, `${jobId}.json`),
                JSON.stringify(payload, null, 2),
                "utf8"
              );
              const runtimeLocalUrl = server.resolvedUrls?.local?.[0]?.replace(/\/$/, "");
              const baseUrl = runtimeLocalUrl ?? `http://127.0.0.1:${server.config.server.port ?? 8080}`;
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
                  waitUntil: "domcontentloaded"
                });
                await page.waitForFunction(() => window.__GG_PRINT_READY === true, null, {
                  timeout: 9e4
                });
                const pdfPath = path.resolve(pdfDir, `${jobId}.pdf`);
                await page.pdf({
                  path: pdfPath,
                  format: "A4",
                  landscape: true,
                  preferCSSPageSize: true,
                  printBackground: true,
                  margin: { top: "0", right: "0", bottom: "0", left: "0" }
                });
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    jobId,
                    pdfPath
                  })
                );
                console.log(`[pdf:${jobId}] generated ${pdfPath}`);
              } finally {
                await browser.close();
              }
              return;
            }
            return next();
          } catch (e) {
            const rawMessage = e instanceof Error ? e.message : String(e);
            const message = /Executable doesn't exist|playwright install/i.test(rawMessage) ? "Chromium is not installed for Playwright. Run: npx playwright install chromium" : rawMessage;
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "pdf_backend_error", message }));
          }
        };
        server.middlewares.use(middleware);
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWxleGFuZGVybWNmYWR6ZWFuL2dyZWV0aW5nLWdlbS1haVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FsZXhhbmRlcm1jZmFkemVhbi9ncmVldGluZy1nZW0tYWkvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FsZXhhbmRlcm1jZmFkemVhbi9ncmVldGluZy1nZW0tYWkvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHR5cGUgeyBDb25uZWN0IH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5pbXBvcnQgZnMgZnJvbSBcIm5vZGU6ZnMvcHJvbWlzZXNcIjtcbmltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tIFwibm9kZTpmc1wiO1xuaW1wb3J0IHsgcmFuZG9tVVVJRCB9IGZyb20gXCJub2RlOmNyeXB0b1wiO1xuaW1wb3J0IHR5cGUgeyBJbmNvbWluZ01lc3NhZ2UgfSBmcm9tIFwibm9kZTpodHRwXCI7XG5pbXBvcnQgeyBjaHJvbWl1bSB9IGZyb20gXCJAcGxheXdyaWdodC90ZXN0XCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjEyNy4wLjAuMVwiLFxuICAgIHBvcnQ6IDgwODAsXG4gICAgaG1yOiB7XG4gICAgICBvdmVybGF5OiBmYWxzZSxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCksXG4gICAge1xuICAgICAgbmFtZTogXCJnZy1wZGYtYmFja2VuZFwiLFxuICAgICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgICAvLyBEZXYtb25seTogc2VydmUgdXNlci1wcm92aWRlZCBcImVhc3RlciAuLi4yXCIgYmFja2dyb3VuZCB0ZXh0dXJlcyBmcm9tIEN1cnNvciBhc3NldHMuXG4gICAgICAgIC8vIEtlZXBzIHRoZSBsYW5kaW5nL3ByZXZpZXcgaW1hZ2VzIHVuY2hhbmdlZCB3aGlsZSBjdXN0b21pemluZyB1c2VzIHRoZSBcIjJcIiB0ZW1wbGF0ZXMuXG4gICAgICAgIGNvbnN0IGVhc3RlcjJBc3NldHNCYXNlID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgIF9fZGlybmFtZSxcbiAgICAgICAgICBcIi4uXCIsXG4gICAgICAgICAgXCIuY3Vyc29yXCIsXG4gICAgICAgICAgXCJwcm9qZWN0c1wiLFxuICAgICAgICAgIFwiVXNlcnMtYWxleGFuZGVybWNmYWR6ZWFuLWdyZWV0aW5nLWdlbS1haVwiLFxuICAgICAgICAgIFwiYXNzZXRzXCJcbiAgICAgICAgKTtcblxuICAgICAgICBhc3luYyBmdW5jdGlvbiByZWFkSnNvbkJvZHkocmVxOiBJbmNvbWluZ01lc3NhZ2UpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHVua25vd24+PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gXCJcIjtcbiAgICAgICAgICAgIHJlcS5vbihcImRhdGFcIiwgKGNodW5rOiBCdWZmZXIpID0+IHtcbiAgICAgICAgICAgICAgZGF0YSArPSBjaHVuay50b1N0cmluZyhcInV0ZjhcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlcS5vbihcImVuZFwiLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhID8gSlNPTi5wYXJzZShkYXRhKSA6IHt9KTtcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXEub24oXCJlcnJvclwiLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWlkZGxld2FyZTogQ29ubmVjdC5OZXh0SGFuZGxlRnVuY3Rpb24gPSBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFyZXEudXJsKSByZXR1cm4gbmV4dCgpO1xuXG4gICAgICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gXCJHRVRcIiAmJiByZXEudXJsLnN0YXJ0c1dpdGgoXCIvZWFzdGVyMi9cIikpIHtcbiAgICAgICAgICAgICAgY29uc3QgcmF3ID0gcmVxLnVybC5zcGxpdChcIi9lYXN0ZXIyL1wiKVsxXT8uc3BsaXQoXCI/XCIpWzBdID8/IFwiXCI7XG4gICAgICAgICAgICAgIGNvbnN0IHNhZmVOYW1lID0gcGF0aC5iYXNlbmFtZShkZWNvZGVVUklDb21wb25lbnQocmF3KSk7XG4gICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKGVhc3RlcjJBc3NldHNCYXNlLCBzYWZlTmFtZSk7XG4gICAgICAgICAgICAgIGlmIChleGlzdHNTeW5jKGZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IGF3YWl0IGZzLnJlYWRGaWxlKGZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiaW1hZ2UvcG5nXCIpO1xuICAgICAgICAgICAgICAgIHJlcy5lbmQoYnVmKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09IFwiR0VUXCIgJiYgcmVxLnVybC5zdGFydHNXaXRoKFwiL2FwaS9wZGYtam9iL1wiKSkge1xuICAgICAgICAgICAgICBjb25zdCBqb2JJZCA9IGRlY29kZVVSSUNvbXBvbmVudChyZXEudXJsLnNwbGl0KFwiL2FwaS9wZGYtam9iL1wiKVsxXSA/PyBcIlwiKTtcbiAgICAgICAgICAgICAgY29uc3Qgam9iUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiZ2VuZXJhdGVkL3BkZi1qb2JzXCIsIGAke2pvYklkfS5qc29uYCk7XG4gICAgICAgICAgICAgIGlmICghZXhpc3RzU3luYyhqb2JQYXRoKSkge1xuICAgICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDA0O1xuICAgICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogXCJub3RfZm91bmRcIiB9KSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IGpzb24gPSBhd2FpdCBmcy5yZWFkRmlsZShqb2JQYXRoLCBcInV0ZjhcIik7XG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgICAgICAgICAgICByZXMuZW5kKGpzb24pO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXEubWV0aG9kID09PSBcIlBPU1RcIiAmJiByZXEudXJsID09PSBcIi9hcGkvcmVuZGVyLXBkZlwiKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCByZWFkSnNvbkJvZHkocmVxKTtcbiAgICAgICAgICAgICAgY29uc3Qgam9iSWQgPSByYW5kb21VVUlEKCk7XG4gICAgICAgICAgICAgIGNvbnN0IGpvYnNEaXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImdlbmVyYXRlZC9wZGYtam9ic1wiKTtcbiAgICAgICAgICAgICAgY29uc3QgcGRmRGlyID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJnZW5lcmF0ZWQvcGRmc1wiKTtcbiAgICAgICAgICAgICAgYXdhaXQgZnMubWtkaXIoam9ic0RpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgICAgICAgIGF3YWl0IGZzLm1rZGlyKHBkZkRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShcbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoam9ic0RpciwgYCR7am9iSWR9Lmpzb25gKSxcbiAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShwYXlsb2FkLCBudWxsLCAyKSxcbiAgICAgICAgICAgICAgICBcInV0ZjhcIlxuICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgIC8vIFVzZSB0aGUgYWN0dWFsIHJ1bnRpbWUgZGV2IFVSTCAocG9ydCBjYW4gYXV0by1pbmNyZW1lbnQgd2hlbiA4MDgwIGlzIG9jY3VwaWVkKS5cbiAgICAgICAgICAgICAgY29uc3QgcnVudGltZUxvY2FsVXJsID0gc2VydmVyLnJlc29sdmVkVXJscz8ubG9jYWw/LlswXT8ucmVwbGFjZSgvXFwvJC8sIFwiXCIpO1xuICAgICAgICAgICAgICBjb25zdCBiYXNlVXJsID1cbiAgICAgICAgICAgICAgICBydW50aW1lTG9jYWxVcmwgPz8gYGh0dHA6Ly8xMjcuMC4wLjE6JHtzZXJ2ZXIuY29uZmlnLnNlcnZlci5wb3J0ID8/IDgwODB9YDtcbiAgICAgICAgICAgICAgY29uc3QgYnJvd3NlciA9IGF3YWl0IGNocm9taXVtLmxhdW5jaCgpO1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSBhd2FpdCBicm93c2VyLm5ld1BhZ2UoKTtcbiAgICAgICAgICAgICAgICBwYWdlLm9uKFwiY29uc29sZVwiLCAobXNnKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAobXNnLnR5cGUoKSA9PT0gXCJlcnJvclwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtwZGY6JHtqb2JJZH1dIHBhZ2UgY29uc29sZSBlcnJvcjogJHttc2cudGV4dCgpfWApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHBhZ2Uub24oXCJwYWdlZXJyb3JcIiwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3BkZjoke2pvYklkfV0gcGFnZSBlcnJvcjogJHtlcnIubWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhd2FpdCBwYWdlLmdvdG8oYCR7YmFzZVVybH0vcHJpbnQ/am9iSWQ9JHtlbmNvZGVVUklDb21wb25lbnQoam9iSWQpfWAsIHtcbiAgICAgICAgICAgICAgICAgIHdhaXRVbnRpbDogXCJkb21jb250ZW50bG9hZGVkXCIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgcGFnZS53YWl0Rm9yRnVuY3Rpb24oKCkgPT4gKHdpbmRvdyBhcyBXaW5kb3cgJiB7IF9fR0dfUFJJTlRfUkVBRFk/OiBib29sZWFuIH0pLl9fR0dfUFJJTlRfUkVBRFkgPT09IHRydWUsIG51bGwsIHtcbiAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDkwXzAwMCxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHBkZlBhdGggPSBwYXRoLnJlc29sdmUocGRmRGlyLCBgJHtqb2JJZH0ucGRmYCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgcGFnZS5wZGYoe1xuICAgICAgICAgICAgICAgICAgcGF0aDogcGRmUGF0aCxcbiAgICAgICAgICAgICAgICAgIGZvcm1hdDogXCJBNFwiLFxuICAgICAgICAgICAgICAgICAgbGFuZHNjYXBlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgcHJlZmVyQ1NTUGFnZVNpemU6IHRydWUsXG4gICAgICAgICAgICAgICAgICBwcmludEJhY2tncm91bmQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICBtYXJnaW46IHsgdG9wOiBcIjBcIiwgcmlnaHQ6IFwiMFwiLCBib3R0b206IFwiMFwiLCBsZWZ0OiBcIjBcIiB9LFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgICAgICAgICAgICAgcmVzLmVuZChcbiAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgam9iSWQsXG4gICAgICAgICAgICAgICAgICAgIHBkZlBhdGgsXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtwZGY6JHtqb2JJZH1dIGdlbmVyYXRlZCAke3BkZlBhdGh9YCk7XG4gICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgYnJvd3Nlci5jbG9zZSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgICAgICAgICBjb25zdCByYXdNZXNzYWdlID0gZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpO1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IC9FeGVjdXRhYmxlIGRvZXNuJ3QgZXhpc3R8cGxheXdyaWdodCBpbnN0YWxsL2kudGVzdChyYXdNZXNzYWdlKVxuICAgICAgICAgICAgICA/IFwiQ2hyb21pdW0gaXMgbm90IGluc3RhbGxlZCBmb3IgUGxheXdyaWdodC4gUnVuOiBucHggcGxheXdyaWdodCBpbnN0YWxsIGNocm9taXVtXCJcbiAgICAgICAgICAgICAgOiByYXdNZXNzYWdlO1xuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogXCJwZGZfYmFja2VuZF9lcnJvclwiLCBtZXNzYWdlIH0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UobWlkZGxld2FyZSk7XG4gICAgICB9LFxuICAgIH0sXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZTLFNBQVMsb0JBQW9CO0FBRTFVLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFDaEMsT0FBTyxRQUFRO0FBQ2YsU0FBUyxrQkFBa0I7QUFDM0IsU0FBUyxrQkFBa0I7QUFFM0IsU0FBUyxnQkFBZ0I7QUFUekIsSUFBTSxtQ0FBbUM7QUFZekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FB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
