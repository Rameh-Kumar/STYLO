import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { UserConfig } from 'vite';

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

export default defineConfig(({ mode, command }): UserConfig => {
    // Load env file based on `mode` in the current directory.
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // Only use custom logger in development
      ...(command === 'serve' && { customLogger }),
      define: {
        'process.env': {}
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

