import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
const base = process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 5173,
    host: true,
  },
})