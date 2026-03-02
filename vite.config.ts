import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    port: 2100
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // Production optimizations
    minify: 'esbuild',
    // Drop console.log/debug/info/warn in production via esbuild (safe, AST-based)
    // console.error is preserved for runtime error visibility
    ...(process.env.NODE_ENV === 'production' ? {
      esbuildOptions: {
        drop: ['debugger'],
        pure: ['console.log', 'console.debug', 'console.info', 'console.warn']
      }
    } : {}),
    // Chunk size optimization
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['maska']
        }
      }
    },
    // Source maps (disable in production for security)
    sourcemap: false
  }
})