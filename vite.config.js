import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "react-pdf/dist/Page/AnnotationLayer.css":
        "react-pdf/dist/esm/Page/AnnotationLayer.css",
      "react-pdf/dist/Page/TextLayer.css":
        "react-pdf/dist/esm/Page/TextLayer.css",
    },
  },
  optimizeDeps: {
    include: ["react-pdf"],
  },
  preview: {
    allowedHosts: true,
  },
});
