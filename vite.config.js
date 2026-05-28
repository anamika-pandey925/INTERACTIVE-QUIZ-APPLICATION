import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/INTERACTIVE-QUIZ-APPLICATION/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
  },
})
