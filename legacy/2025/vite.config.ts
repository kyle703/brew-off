import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  base: "/history/2025/",
  plugins: [react()],
  build: {
    outDir: resolve(root, "../../public/history/2025"),
    emptyOutDir: true,
  },
});
