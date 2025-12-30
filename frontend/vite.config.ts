import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    host: true, // permette accesso da altri dispositivi sulla LAN
    port: 1974,
    strictPort: true,
    allowedHosts: ['mahalia-undazzled-unsqueamishly.ngrok-free.dev'],
    hmr: {
      host: 'mahalia-undazzled-unsqueamishly.ngrok-free.dev',
      protocol: 'wss',
      clientPort: 443,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
