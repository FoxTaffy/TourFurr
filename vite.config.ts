import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// Simple plugin to remove console.* in production
const removeConsolePlugin = () => {
  return {
    name: 'remove-console',
    transform(code: string, id: string) {
      // Only process our source files, not node_modules
      if (process.env.NODE_ENV === 'production' &&
          /\.(js|ts|vue)$/.test(id) &&
          !id.includes('node_modules')) {
        return {
          code: code
            .replace(/console\.(log|debug|info|warn)\s*\([^)]*\)\s*;?/g, '')
            .replace(/console\.(log|debug|info|warn)\s*\([^)]*\)/g, 'void 0'),
          map: null
        }
      }
      return null
    }
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), removeConsolePlugin()],
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
    minify: 'esbuild', // Use built-in esbuild instead of terser
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