import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/TerrainGenerator/' : '/',
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (/node_modules[\\/]three[\\/]/.test(id)) {
            return 'vendor-three-core'
          }

          if (id.includes('@react-three/fiber')) {
            return 'vendor-r3f'
          }

          if (/node_modules[\\/](react|react-dom|scheduler|react-reconciler)/.test(id)) {
            return 'vendor-react'
          }

          if (id.includes('leva') || id.includes('zustand')) {
            return 'vendor-ui'
          }

          return 'vendor-misc'
        },
      },
    },
  },
})
