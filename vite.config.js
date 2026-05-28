import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': {},
    'global': 'window',
  },
  optimizeDeps: {
    exclude: ['@capacitor/app', '@capacitor/browser', '@capacitor/core'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ['@capacitor/app', '@capacitor/browser', '@capacitor/core'],
      output: {
        globals: {
          '@capacitor/app': 'CapacitorApp',
          '@capacitor/browser': 'CapacitorBrowser',
          '@capacitor/core': 'CapacitorCore',
        }
      }
    }
  }
})
