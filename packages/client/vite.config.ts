import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      shared: resolve(__dirname, "../shared/index.ts"),
    },
  },
  server: {
    port: 1234,
    watch: {
      ignored: ["!**/node_modules/shared/**"],
    },
    fs: {
      allow: [".."],
    },
    proxy: {
      "/borrowers": {
        target: "http://localhost:1337",
        changeOrigin: true,
      },
    },
  },
});
