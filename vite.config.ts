import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from the environment Vercel provides
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This line is crucial. It finds `process.env.API_KEY` in our code
      // and replaces it with the actual key from Vercel's environment variables at build time.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
});
