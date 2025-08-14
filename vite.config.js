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
    // 'process.env': process.env,
  },
  build: {
    // Don't externalize Google Maps to ensure it's properly bundled
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    // Add headers to handle Content Security Policy (CSP)
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://*.gstatic.com https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; img-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://*.ggpht.com https://lh3.googleusercontent.com https://*.cloudfront.net https://*.travelapi.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://localhost:3000 https://*.googleapis.com https://*.gstatic.com;",
    },
  },
});
