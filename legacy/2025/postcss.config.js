import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    tailwindcss: { config: join(root, "tailwind.config.js") },
    autoprefixer: {},
  },
};
