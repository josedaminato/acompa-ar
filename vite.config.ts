import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages usa subruta /acompa-ar/ → definir VITE_BASE_URL en CI (ver workflow).
// Vercel / local: base "/"
const base = (process.env.VITE_BASE_URL ?? '/').replace(/([^/])$/, '$1/')

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
