import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import cogsSdkPlugin from "vite-plugin-cogs-sdk";

export default defineConfig({
  base: "./",
  build: {
    sourcemap: true,
  },
  plugins: [react(), cogsSdkPlugin()],
});
