import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
    esbuild: {
    target: 'esnext' // Target the latest JavaScript environment
  },
  build: {
    target: 'esnext' // Also set for the build target
  }
})
