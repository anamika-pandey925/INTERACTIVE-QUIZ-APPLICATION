import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom plugin to serve dev.html at the root / during development
const devRedirectPlugin = {
  name: 'dev-redirect',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/' || req.url === '/index.html') {
        req.url = '/dev.html';
      }
      next();
    });
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/INTERACTIVE-QUIZ-APPLICATION/',
  plugins: [
    react(),
    tailwindcss(),
    command === 'serve' ? devRedirectPlugin : null,
  ].filter(Boolean),
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'dev.html',
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: true,
  },
}))
