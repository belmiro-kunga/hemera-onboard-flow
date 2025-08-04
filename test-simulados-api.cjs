// Test simulados API endpoint
const http = require('http');

console.log('🔄 Testing simulados API endpoint...');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/simulados',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`✅ Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Response body:', data);
    try {
      const jsonData = JSON.parse(data);
      console.log('✅ Parsed JSON:', JSON.stringify(jsonData, null, 2));
    } catch (error) {
      console.log('❌ Failed to parse JSON:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
});

req.end();