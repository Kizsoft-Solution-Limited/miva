import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    name: 'web-unit',
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
  },
})
