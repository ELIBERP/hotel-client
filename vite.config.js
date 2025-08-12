import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  test: {
    globals: true, // If you want global test functions like 'describe', 'it', etc.
    environment: 'jsdom', // Use jsdom environment for DOM-related tests
    setupFiles: ['./test/setup.js'], // Optional: add setup files like mock setups
  },
})
