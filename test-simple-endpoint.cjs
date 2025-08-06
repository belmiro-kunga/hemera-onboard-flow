// Simple test for API endpoints
const http = require('http');

async function testSimpleEndpoint() {
  try {
    console.log('🔄 Testing simple endpoints...');

    // Test health endpoint first
    console.log('\n1. Testing health endpoint...');
    const healthOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET'
    };

    const healthResponse = await new Promise((resolve, reject) => {
      const req = http.request(healthOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', reject);
      req.end();
    });

    console.log(`Health Status: ${healthResponse.status}`);
    console.log(`Health Response: ${healthResponse.data}`);

    // Test video-courses endpoint
    console.log('\n2. Testing video-courses endpoint...');
    const coursesOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/video-courses',
      method: 'GET'
    };

    const coursesResponse = await new Promise((resolve, reject) => {
      const req = http.request(coursesOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', reject);
      req.end();
    });

    console.log(`Courses Status: ${coursesResponse.status}`);
    console.log(`Courses Response: ${coursesResponse.data.substring(0, 200)}...`);

    if (coursesResponse.status === 404) {
      console.log('\n❌ 404 Error - Route not found!');
      console.log('This suggests the video-courses route is not registered properly.');
    } else if (coursesResponse.status === 200) {
      console.log('\n✅ Video courses endpoint is working!');
    }

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
  }
}

testSimpleEndpoint();