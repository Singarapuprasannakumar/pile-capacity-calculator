import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    /**
     * Dev-server proxy: any request to /api/** is forwarded to the FastAPI
     * backend running on localhost:8000, stripping the /api prefix.
     *
     * This means the browser only ever talks to localhost:5173 (same origin),
     * so CORS is completely bypassed during development.
     *
     * e.g. POST /api/calculate  →  POST http://localhost:8000/calculate
     */
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // Uncomment to see every proxied request in the Vite terminal:
        // configure: (proxy) => { proxy.on('proxyReq', (r) => console.log('[proxy]', r.path)); },
      },
    },
  },
})
