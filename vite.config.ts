import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    proxy: {
      '/api': 'http://localhost:4005',
      '/ws': {
        target: 'ws://localhost:4005',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
