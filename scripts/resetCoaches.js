#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Execute the TypeScript script using ts-node
const scriptPath = path.join(__dirname, '../src/scripts/cleanupAndSetupCoaches.ts');
const tsNode = spawn('npx', ['ts-node', scriptPath], {
  stdio: 'inherit',
  shell: true
});

tsNode.on('error', (error) => {
  console.error('Failed to start script:', error);
  process.exit(1);
});

tsNode.on('close', (code) => {
  if (code !== 0) {
    console.error(`Script exited with code ${code}`);
    process.exit(code);
  }
}); 