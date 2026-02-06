import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: path.join(process.cwd(), "src", "renderer"),
  plugins: [react()],
  base: "./",
  define: {
    "process.env": {},
  },
  build: {
    outDir: path.join(process.cwd(), "dist", "renderer"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
