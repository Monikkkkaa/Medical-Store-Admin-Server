#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Medical Store Server Test Suite');
console.log('==================================\n');

try {
  // Install test dependencies
  console.log('📦 Installing test dependencies...');
  execSync('npm install', { 
    cwd: path.join(__dirname),
    stdio: 'inherit' 
  });

  // Run tests
  console.log('\n🚀 Running tests...\n');
  execSync('npm test', { 
    cwd: path.join(__dirname),
    stdio: 'inherit' 
  });

  console.log('\n✅ All tests completed successfully!');
} catch (error) {
  console.error('\n❌ Tests failed:', error.message);
  process.exit(1);
}