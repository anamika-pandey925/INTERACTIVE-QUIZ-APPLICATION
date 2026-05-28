import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // Relative paths for perfect subdirectory and GitHub Pages support
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
  }
})

