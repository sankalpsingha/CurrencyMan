#!/usr/bin/env node

/**
 * Simple test runner for CurrencyMan regex tests
 * This script loads and runs the tests in regex-unit-tests.js
 */

const Mocha = require('mocha');
const path = require('path');
const fs = require('fs');

// Create a new Mocha instance
const mocha = new Mocha({
  reporter: 'spec',
  timeout: 5000
});

// Add the test file
const testFile = path.join(__dirname, '..', 'regex-unit-tests.js');
if (fs.existsSync(testFile)) {
  mocha.addFile(testFile);
} else {
  console.error(`Test file not found: ${testFile}`);
  process.exit(1);
}

// Run the tests
mocha.run(failures => {
  process.exitCode = failures ? 1 : 0;
  
  if (failures) {
    console.log(`\n❌ Tests completed with ${failures} failure(s)`);
  } else {
    console.log('\n✅ All tests passed successfully!');
  }
});
