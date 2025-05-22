import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main process entry file
        entry: 'electron/main.ts',
        onstart(options) {
          // Only restart when main process files change
          options.startup()
        },
        vite: {
          build: {
            sourcemap: true,
            minify: false,
            outDir: 'dist/electron',
            rollupOptions: {
              external: ['@prisma/client', 'prisma', 'sqlite3']
            }
          }
        }
      },
      {
        // Preload script entry file
        entry: 'electron/preload.ts',
        onstart(options) {
          // Reload renderer when preload script changes
          options.reload()
        },
        vite: {
          build: {
            sourcemap: true,
            minify: false,
            outDir: 'dist/electron',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    minify: false
  }
})