import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // @solana/web3.js expects a Node-style `global`; map it to the browser global.
  define: {
    global: 'globalThis',
  },
})
