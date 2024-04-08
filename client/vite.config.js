import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [react(), eslint()]
})

