import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'assets',
          dest: '.',
        },
        {
          src: 'map-v3.tmx',
          dest: '.',
        },
      ],
    }),
  ],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2000, // Phaser is large
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});
