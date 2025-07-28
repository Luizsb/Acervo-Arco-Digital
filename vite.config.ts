// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     exclude: ['lucide-react'],
//   },
// });


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Configuração para GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/Acervo-Arco-Digital/' : '/',
  build: {
    // Garante que os assets sejam relativos
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Usa caminhos relativos para os assets
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  // Configuração para desenvolvimento
  server: {
    port: 3000,
    open: true,
  },
})