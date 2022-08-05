import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    react(),
    electron({
        main: {
          entry: 'public/electron.js',
        },
    })
  ],
  server: {
    port: 3333,
    open: true
  },
})