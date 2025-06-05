import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Build optimizations for production
  build: {
    // Aggressive minification
    minify: "esbuild",
    target: "esnext",

    // Disable source maps for smaller builds
    sourcemap: false,

    // More aggressive code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          redux: ["@reduxjs/toolkit", "react-redux", "redux-persist"],
          ui: ["@mui/material", "@emotion/react", "@emotion/styled"],
          charts: ["chart.js"],
          zoom: ["@zoom/meetingsdk"],
        },
        // Generate smaller chunk names
        chunkFileNames: "js/[name]-[hash:8].js",
        entryFileNames: "js/[name]-[hash:8].js",
        assetFileNames: "assets/[name]-[hash:8].[ext]",
      },
    },

    // Smaller chunk size limit
    chunkSizeWarningLimit: 800,

    // Enable compression
    reportCompressedSize: false, // Disable for faster builds
  },
  // Development server optimizations
  server: {
    host: true,
    port: 5173, // Use Vite default port

    // Minimal HMR for less cache
    hmr: {
      overlay: false,
    },

    // Clear cache on restart
    force: true,
  },

  // Dependency optimization - minimal caching
  optimizeDeps: {
    include: ["react", "react-dom"],
    exclude: ["@zoom/meetingsdk", "lib-jitsi-meet"],
    force: true, // Force re-optimization
  },

  // Disable cache directory for minimal cache
  cacheDir: false,

  // Preview server config
  preview: {
    port: 4173,
    host: true,
  },
});
