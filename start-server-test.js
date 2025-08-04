// Keep server running for testing
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting API server for testing...');

const server = spawn('npm', ['run', 'api'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  detached: false
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...');
  server.kill();
  process.exit(0);
});

console.log('✅ Server started. Press Ctrl+C to stop.');