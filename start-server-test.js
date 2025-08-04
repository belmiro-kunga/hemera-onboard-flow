// Simple test to start the API server
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting API server test...');

const serverPath = path.join(__dirname, 'backend', 'api-server.js');
console.log('Server path:', serverPath);

const server = spawn('node', [serverPath], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Keep the process alive for a few seconds
setTimeout(() => {
  console.log('Stopping test...');
  server.kill();
}, 10000);