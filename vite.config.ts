import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";
import { resolve } from "node:path";
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react()],
  optimizeDeps: { entries: ["index.html"] },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // Copied evidence and test clusters are not application inputs.
      ignored: ["src-tauri", "legacy", "analysis-local", "GestaoOficinas_TesteIA", "migrate-windev-javascript", ".venv"]
        .map(folder => `${resolve(folder).replaceAll("\\", "/")}/**`),
    },
  },
}));
