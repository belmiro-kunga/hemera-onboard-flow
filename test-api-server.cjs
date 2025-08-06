// Test API server startup and endpoints
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

async function testAPIServer() {
  console.log('🔄 Testing API server...');

  // Kill any existing processes
  try {
    const { execSync } = require('child_process');
    execSync('pkill -f api-server.js', { stdio: 'ignore' });
    console.log('🧹 Cleaned up existing processes');
  } catch (error) {
    // Ignore errors if no processes to kill
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Start API server
  console.log('🚀 Starting API server...');
  const serverProcess = spawn('npm', ['run', 'api'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'pipe'
  });

  let serverOutput = '';
  serverProcess.stdout.on('data', (data) => {
    serverOutput += data.toString();
    console.log('📡 Server:', data.toString().trim());
  });

  serverProcess.stderr.on('data', (data) => {
    console.error('❌ Server Error:', data.toString().trim());
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Test health endpoint
  console.log('\n🔍 Testing health endpoint...');
  try {
    const healthResponse = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/api/health',
        method: 'GET'
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Timeout')));
      req.end();
    });

    console.log('✅ Health check:', healthResponse.status, healthResponse.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }

  // Test video courses endpoint
  console.log('\n🔍 Testing video courses endpoint...');
  try {
    const coursesResponse = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/api/video-courses',
        method: 'GET'
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Timeout')));
      req.end();
    });

    console.log('✅ Video courses:', coursesResponse.status);
    if (coursesResponse.status === 200) {
      const json = JSON.parse(coursesResponse.data);
      console.log('📚 Courses found:', json.data?.length || 0);
    }
  } catch (error) {
    console.error('❌ Video courses test failed:', error.message);
  }

  // Keep server running
  console.log('\n✅ API server is running. Press Ctrl+C to stop.');
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping server...');
    serverProcess.kill();
    process.exit(0);
  });
}

testAPIServer().catch(console.error);