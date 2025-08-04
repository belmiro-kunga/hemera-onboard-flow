#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');

async function checkAPIRunning() {
  return new Promise((resolve) => {
    exec('curl -s http://localhost:3001/api/health', (error, stdout, stderr) => {
      if (error) {
        resolve(false);
      } else {
        try {
          const response = JSON.parse(stdout);
          resolve(response.status === 'ok');
        } catch {
          resolve(false);
        }
      }
    });
  });
}

async function startAPIServer() {
  console.log('🚀 Starting API server...');
  
  const serverProcess = spawn('npm', ['run', 'api'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    detached: true
  });

  serverProcess.unref();
  
  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return serverProcess;
}

async function ensureAPIRunning() {
  console.log('🔍 Checking if API server is running...');
  
  const isRunning = await checkAPIRunning();
  
  if (isRunning) {
    console.log('✅ API server is already running');
    return true;
  }
  
  console.log('❌ API server is not running, starting it...');
  await startAPIServer();
  
  // Check again after starting
  const isNowRunning = await checkAPIRunning();
  
  if (isNowRunning) {
    console.log('✅ API server started successfully');
    return true;
  } else {
    console.log('❌ Failed to start API server');
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  ensureAPIRunning().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { ensureAPIRunning, checkAPIRunning };