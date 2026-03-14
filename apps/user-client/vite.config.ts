import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    host: true,
    proxy: {
      '/api': {
        target: process.env.API_TARGET ?? 'http://localhost:3002',
        changeOrigin: true,
      },
      '/news': {
        target: process.env.API_TARGET ?? 'http://localhost:3002',
        changeOrigin: true,
      },
      '/pipeline': {
        target: process.env.API_TARGET ?? 'http://localhost:3002',
        changeOrigin: true,
      },
      '/categories': {
        target: process.env.API_TARGET ?? 'http://localhost:3002',
        changeOrigin: true,
      },
      '/keywords': {
        target: process.env.API_TARGET ?? 'http://localhost:3002',
        changeOrigin: true,
      },
      '/filter-keywords': {
        target: process.env.API_TARGET ?? 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
});
