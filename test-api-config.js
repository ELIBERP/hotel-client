#!/usr/bin/env node

// Quick test to verify frontend API configuration
import config, { buildApiUrl } from './src/config/env.js';

console.log('🔍 Frontend API Configuration Test');
console.log('=====================================');
console.log('Base URL:', config.apiBaseUrl);
console.log('Auth endpoint:', buildApiUrl('/auth/login'));
console.log('Register endpoint:', buildApiUrl('/auth/register'));
console.log('Bookings endpoint:', buildApiUrl('/bookings'));
console.log('');

// Test the actual endpoints
console.log('✅ Expected endpoints:');
console.log('  Login: http://localhost:3000/auth/login');
console.log('  Register: http://localhost:3000/auth/register');
console.log('  Bookings: http://localhost:3000/bookings');
console.log('');

// Check if they match
const loginUrl = buildApiUrl('/auth/login');
const registerUrl = buildApiUrl('/auth/register');

if (loginUrl === 'http://localhost:3000/auth/login') {
  console.log('✅ Login endpoint: CORRECT');
} else {
  console.log('❌ Login endpoint: INCORRECT -', loginUrl);
}

if (registerUrl === 'http://localhost:3000/auth/register') {
  console.log('✅ Register endpoint: CORRECT');
} else {
  console.log('❌ Register endpoint: INCORRECT -', registerUrl);
}

console.log('\n🎯 If any endpoints are incorrect, restart the frontend server!');
