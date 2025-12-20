import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover'],
          'utils-vendor': ['axios', 'socket.io-client', 'date-fns', 'lodash']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit
    sourcemap: process.env.NODE_ENV !== 'production'
  }
})