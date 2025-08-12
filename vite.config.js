import { defineConfig } from 'vite'  // Only import from Vite
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // If you want global test functions like 'describe', 'it', etc.
    environment: 'jsdom', // Use jsdom environment for DOM-related tests
    setupFiles: ['./vitest-setup.js'], // Optional: add setup files like mock setups
    include: ['tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  }
});
