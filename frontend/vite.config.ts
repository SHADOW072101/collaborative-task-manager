import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  css: {
    postcss: './postcss.config.js',
  },
  base: process.env.VITE_BASE_URL || '/collaborative-task-manager',
})