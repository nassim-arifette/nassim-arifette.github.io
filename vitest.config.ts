import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  cacheDir: path.join(process.cwd(), '.vitest'),
  test: {
    // Default to jsdom for component and DOM-oriented tests; pure utils still work here
    environment: 'jsdom',
    include: [
      '**/*.{test,spec}.{ts,tsx,js,jsx}',
      '!**/.contentlayer/**',
      '!**/.next/**',
      '!**/node_modules/**',
      '!**/out/**',
    ],
    globals: true,
    setupFiles: ['vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'contentlayer/generated': path.resolve(__dirname, './.contentlayer/generated'),
    },
  },
})
