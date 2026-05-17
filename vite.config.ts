import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://astraja.vilniustech.lt:8443',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/ords/stud_732/karate'),
      },
    },
  },
})