// Test video courses endpoint using http module
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

async function testVideoCoursesAPI() {
  try {
    console.log('🔄 Testing Video Courses API endpoints...');

    // Test health
    console.log('\n1. Testing health endpoint...');
    const healthResult = await testEndpoint('/api/health');
    console.log(`Status: ${healthResult.status}`);
    console.log(`Response:`, healthResult.data);

    // Test video courses
    console.log('\n2. Testing video courses endpoint...');
    const coursesResult = await testEndpoint('/api/video-courses');
    console.log(`Status: ${coursesResult.status}`);
    console.log(`Response:`, coursesResult.data);

    if (coursesResult.data && coursesResult.data.success) {
      console.log(`\n✅ Found ${coursesResult.data.data.length} video courses`);
      if (coursesResult.data.data.length > 0) {
        console.log('\n📚 Video courses:');
        coursesResult.data.data.forEach((course, index) => {
          console.log(`${index + 1}. ${course.title} (${course.category}) - ${course.is_active ? 'Active' : 'Inactive'}`);
          console.log(`   - Duration: ${course.duration_minutes}min`);
          console.log(`   - Lessons: ${course.lesson_count || 0}`);
          console.log(`   - Enrollments: ${course.enrollment_count || 0}`);
        });
      }
    }

    console.log('\n🎉 Video Courses API test completed!');

  } catch (error) {
    console.error('❌ Error testing Video Courses API:', error.message);
  }
}

testVideoCoursesAPI();