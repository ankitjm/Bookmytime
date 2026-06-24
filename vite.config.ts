import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path is deploy-target specific:
//   - Netlify / Vercel / local preview serve at the domain root  -> '/'
//   - GitHub Pages serves under the repo name -> '/Bookmytime/' (set via DEPLOY_BASE)
// Set DEPLOY_BASE in the deploy environment to override; defaults to root.
const base = process.env.DEPLOY_BASE || '/'

export default defineConfig({
  plugins: [react()],
  base,
  server: { host: true },
})
