// Mocha global setup for all tests
// This file runs before any test files

// Increase timeout for VS Code extension tests
const DEFAULT_TIMEOUT = 10000;

// Setup Mocha
if (typeof Mocha !== 'undefined') {
  Mocha.timeout(DEFAULT_TIMEOUT);
}

// Global test setup
console.log('Mocha test environment initialized');
