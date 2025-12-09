import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente (inclusive do Vercel)
  // Using '.' instead of process.cwd() to avoid TypeScript error regarding 'cwd' property on 'Process' type
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    build: {
      target: 'esnext',
      outDir: 'dist'
    },
    define: {
      // Isso permite que o código use process.env.API_KEY no navegador
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})