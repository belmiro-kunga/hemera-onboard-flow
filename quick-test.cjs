// Quick test of the video courses API
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/video-courses',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Success:', json.success);
      console.log('Courses found:', json.data?.length || 0);
      if (json.data && json.data.length > 0) {
        console.log('First course:', json.data[0].title);
      }
    } catch (error) {
      console.log('Raw response:', data.substring(0, 200));
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();