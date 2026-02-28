import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        popup: path.resolve(__dirname, 'src/popup.tsx'),
        dashboard: path.resolve(__dirname, 'src/pages/dashboard.tsx'),
        background: path.resolve(__dirname, 'src/background.ts'),
      },
      formats: ['es']
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
