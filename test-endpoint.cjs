// Simple test for endpoint
const http = require('http');

function testEndpoint(port, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔄 Testing endpoints...');
  
  try {
    // Test the test server
    console.log('Testing port 3002...');
    const result1 = await testEndpoint(3002, '/api/test');
    console.log('✅ Port 3002 test:', result1.status, result1.data);
    
    const result2 = await testEndpoint(3002, '/api/simulados/test');
    console.log('✅ Port 3002 simulados test:', result2.status, result2.data);
    
    const result3 = await testEndpoint(3002, '/api/simulados');
    console.log('✅ Port 3002 simulados:', result3.status, result3.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();