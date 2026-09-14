import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@parity/shared': path.resolve(__dirname, '../shared/src/types-index.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: false,
    cssMinify: true,
    minify: 'esbuild',
    modulePreload: { polyfill: false },
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react';
          }
        },
      },
    },
  },
});
