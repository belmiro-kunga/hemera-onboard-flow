// Test endpoint using http module
const http = require('http');

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testAPI() {
  try {
    console.log('🔄 Testing API endpoints...');

    // Test health
    console.log('\n1. Testing health endpoint...');
    const healthResult = await testEndpoint('/api/health');
    console.log(`Status: ${healthResult.status}`);
    console.log(`Response:`, healthResult.data);

    // Test simulados
    console.log('\n2. Testing simulados endpoint...');
    const simuladosResult = await testEndpoint('/api/simulados');
    console.log(`Status: ${simuladosResult.status}`);
    console.log(`Response:`, simuladosResult.data);

    if (simuladosResult.data && simuladosResult.data.success) {
      console.log(`\n✅ Found ${simuladosResult.data.data.length} simulados`);
      if (simuladosResult.data.data.length > 0) {
        console.log('First simulado:', simuladosResult.data.data[0].title);
      }
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPI();