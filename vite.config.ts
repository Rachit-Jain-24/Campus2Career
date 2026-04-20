import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src_1'),
    },
  },
  build: {
    // Production build optimizations
    target: 'esnext',
    minify: 'esbuild', // Use esbuild instead of terser (faster, no extra dependency)
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI libraries
          'ui-vendor': ['lucide-react', 'framer-motion', 'clsx', 'tailwind-merge'],
          
          // Charting
          'chart-vendor': ['recharts'],
          
          // Database & Auth
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Code editor (used in interview simulator)
          'monaco-vendor': ['@monaco-editor/react'],
          
          // PDF processing
          'pdf-vendor': ['pdfjs-dist'],
        },
        // Better asset naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Chunk size warning limit (500 KB)
    chunkSizeWarningLimit: 500,
    
    // Source maps for production debugging (optional)
    sourcemap: false,
    
    // Report compressed sizes
    reportCompressedSize: true,
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
