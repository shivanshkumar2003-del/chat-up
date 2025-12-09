import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    // Standard base path for Vercel
    base: '/', 
    define: {
      // This ensures your code using `process.env.API_KEY` works in the browser
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});