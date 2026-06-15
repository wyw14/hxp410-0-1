import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 41001,
    proxy: {
      '/api': {
        target: 'http://localhost:41101',
        changeOrigin: true
      }
    }
  }
})
