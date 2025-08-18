#!/usr/bin/env node

/**
 * Test Runner for Authentication and Booking Tests
 * 
 * This script runs comprehensive unit and integration tests for:
 * - Authentication (Login/Register)
 * - Booking functionality
 * - Payment processing
 * - API services
 * - Context management
 */

const { execSync } = require('child_process');
const path = require('path');

const testSuites = {
  unit: {
    description: 'Unit Tests for Components, Services, and Context',
    patterns: [
      'tests/unit/components/*.test.jsx',
      'tests/unit/pages/*.test.jsx',
      'tests/unit/services/*.test.js',
      'tests/unit/context/*.test.jsx'
    ]
  },
  integration: {
    description: 'Integration Tests for Complete Flows',
    patterns: [
      'tests/integration/*.test.jsx'
    ]
  },
  auth: {
    description: 'Authentication Tests Only',
    patterns: [
      'tests/unit/components/LoginForm.test.jsx',
      'tests/unit/components/RegisterForm.test.jsx',
      'tests/unit/pages/Login.test.jsx',
      'tests/unit/pages/Register.test.jsx',
      'tests/unit/context/AuthContext.test.jsx',
      'tests/integration/AuthFlow.test.jsx'
    ]
  },
  booking: {
    description: 'Booking and Payment Tests Only',
    patterns: [
      'tests/unit/pages/BookingForm.test.jsx',
      'tests/unit/pages/BookingSuccess.test.jsx',
      'tests/unit/components/PaymentButton.test.jsx',
      'tests/integration/BookingFlow.test.jsx'
    ]
  },
  services: {
    description: 'API Service Tests Only',
    patterns: [
      'tests/unit/services/ApiService.test.js'
    ]
  }
};

function runTests(suite, options = {}) {
  const { coverage = false, watch = false, verbose = false } = options;
  
  console.log(`\n🧪 Running ${testSuites[suite].description}...`);
  console.log('─'.repeat(50));
  
  let command = 'npm test';
  
  if (coverage) {
    command += ' -- --coverage';
  }
  
  if (watch) {
    command += ' -- --watch';
  }
  
  if (verbose) {
    command += ' -- --verbose';
  }
  
  // Add test pattern
  const patterns = testSuites[suite].patterns.join('|');
  command += ` -- --testPathPattern="${patterns}"`;
  
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`\n✅ ${testSuites[suite].description} completed successfully!`);
  } catch (error) {
    console.error(`\n❌ ${testSuites[suite].description} failed!`);
    process.exit(1);
  }
}

function showUsage() {
  console.log(`
🧪 Authentication & Booking Test Runner

Usage: node test-runner.js [suite] [options]

Test Suites:
${Object.entries(testSuites).map(([key, value]) => 
  `  ${key.padEnd(12)} - ${value.description}`
).join('\n')}

Options:
  --coverage   Generate coverage report
  --watch      Run tests in watch mode
  --verbose    Show verbose output
  --help       Show this help message

Examples:
  node test-runner.js unit
  node test-runner.js auth --coverage
  node test-runner.js booking --watch
  node test-runner.js integration --verbose
  node test-runner.js unit --coverage --verbose
`);
}

function main() {
  const args = process.argv.slice(2);
  const suite = args[0];
  
  if (!suite || suite === '--help') {
    showUsage();
    return;
  }
  
  if (!testSuites[suite]) {
    console.error(`❌ Unknown test suite: ${suite}`);
    console.log('\nAvailable suites:', Object.keys(testSuites).join(', '));
    process.exit(1);
  }
  
  const options = {
    coverage: args.includes('--coverage'),
    watch: args.includes('--watch'),
    verbose: args.includes('--verbose')
  };
  
  runTests(suite, options);
}

if (require.main === module) {
  main();
}

module.exports = { runTests, testSuites };
