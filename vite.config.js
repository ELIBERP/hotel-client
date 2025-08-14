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
  },
  define: {
    // Vite allows defining global constants which can be used throughout your app.
    // This ensures that the environment variable is available to the client-side.
    'process.env': process.env,
  },
  build: {
    rollupOptions: {
      // Externalizing google maps as an external resource to ensure Vite handles it correctly
      external: ['https://maps.googleapis.com'],
    },
  },
  // server: {
  //   // In case you're running a backend API, you can proxy requests to avoid CORS issues
  //   proxy: {
  //     '/maps-api': 'https://maps.googleapis.com',
  //   },
  // },
  // Add headers to handle Content Security Policy (CSP) if necessary
  // Make sure the Google Maps API can be loaded even with strict CSP rules.
  // Uncomment the following if you want to set CSP in the development environment
  server: {
    headers: {
      'Content-Security-Policy': "script-src 'self' https://maps.googleapis.com;",
    },
  },
});
