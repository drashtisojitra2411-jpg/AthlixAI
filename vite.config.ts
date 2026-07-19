import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // Restrict to this package's own tests — without this, Vitest's default
    // discovery also picks up backend/src/**/*.test.ts, which use Node's
    // built-in test runner (not Vitest) and depend on backend/.env being
    // loaded from the backend cwd, so they fail when collected from here.
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
  },
})
