import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project is served from https://ankitjm.github.io/Bookmytime/ on GitHub Pages,
// so production assets need the repo name as the base path. Dev stays at root.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/Bookmytime/' : '/',
  server: { host: true },
}))
