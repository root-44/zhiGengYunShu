import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const backendTarget = "http://100.82.194.79:8090";
const apiProxy = {
  "/api": {
    target: backendTarget,
    changeOrigin: true,
  },
  "/uploads": {
    target: backendTarget,
    changeOrigin: true,
  },
};

export default defineConfig({
  appType: "spa",
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: apiProxy,
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: apiProxy,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve("src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
        },
      },
    },
  },
});
