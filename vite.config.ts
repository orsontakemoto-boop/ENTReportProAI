import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from the current directory
  // Fix: Use type assertion on process to access cwd() and resolve Property 'cwd' does not exist on type 'Process'
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    build: {
      target: 'esnext',
      outDir: 'dist'
    },
    define: {
      // Direct replacement for process.env.API_KEY as per GenAI instructions
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  }
})
