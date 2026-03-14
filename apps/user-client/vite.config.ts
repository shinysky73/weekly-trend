import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const apiTarget = process.env.API_TARGET ?? 'http://localhost:3002';
const proxyPaths = ['/api', '/news', '/pipeline', '/categories', '/keywords', '/filter-keywords', '/newsletter'];
const proxy = Object.fromEntries(proxyPaths.map((p) => [p, { target: apiTarget, changeOrigin: true }]));

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
    proxy,
  },
});
