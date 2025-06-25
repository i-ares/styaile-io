import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-extension',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/extensionPopup.tsx'),
        background: resolve(__dirname, 'public/background.js'),
        content: resolve(__dirname, 'public/content.js'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    sourcemap: true,
    minify: 'esbuild',
    target: 'esnext',
    copyPublicDir: true
  },
  publicDir: 'public'
});