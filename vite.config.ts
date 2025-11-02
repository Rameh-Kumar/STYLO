import path from 'path';
import { defineConfig, loadEnv, LogLevel } from 'vite';
import react from '@vitejs/plugin-react';

// Custom logger to filter out public directory warnings
const customLogger = {
  ...console,
  warn: (msg: string, ...args: any[]) => {
    if (msg.includes('public directory is served at the root path')) {
      return;
    }
    console.warn(msg, ...args);
  },
};

export default defineConfig(({ mode, command }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      customLogger: command === 'serve' ? customLogger : undefined,
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
