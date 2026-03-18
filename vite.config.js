import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// SSL 인증서 검증 비활성화 (기업 방화벽/VPN 환경 대응)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('[proxy error]', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[proxy req]', req.method, req.url, '->', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('[proxy res]', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})
