import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Build optimizations
  build: {
    // Reduce bundle size
    minify: "esbuild",
    target: "esnext",

    // Code splitting to prevent large bundles
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          redux: ["@reduxjs/toolkit", "react-redux", "redux-persist"],
          ui: ["@mui/material", "@emotion/react", "@emotion/styled"],
          charts: ["chart.js"],
          zoom: ["@zoom/meetingsdk"],
        },
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Enable source maps for production debugging but smaller
    sourcemap: false,
  },

  // Development server optimizations
  server: {
    host: true,
    port: 3000,

    // Hot reload optimizations
    hmr: {
      overlay: false, // Disable error overlay to prevent memory buildup
    },
  },

  // Dependency optimization
  optimizeDeps: {
    include: ["react", "react-dom", "@reduxjs/toolkit", "react-redux", "axios"],

    // Exclude heavy libs from optimization
    exclude: ["@zoom/meetingsdk", "lib-jitsi-meet"],
  },

  // Cache directory configuration
  cacheDir: "node_modules/.vite",

  // Preview server config
  preview: {
    port: 4173,
    host: true,
  },
});
