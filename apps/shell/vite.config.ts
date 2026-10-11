import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// Оболочка живёт под /shell/ (ассеты), сами маршруты приложений — /<app>/… (Caddy отдаёт shell
// на всё, что не принадлежит tela). В dev /api и страницы tela проксируются на локальный Caddy.
export default defineConfig({
  base: '/shell/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    port: 5180,
    proxy: { '/api': 'http://127.0.0.1:8780', '/ws': { target: 'ws://127.0.0.1:8780', ws: true } },
  },
})
