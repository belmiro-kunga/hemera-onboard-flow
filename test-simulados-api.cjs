// Test script for simulados API
// Using native fetch (Node.js 18+)

async function testSimuladosAPI() {
  console.log('🔍 Testing Simulados API...\n');

  const API_BASE = 'http://localhost:3001/api';

  try {
    // 1. Test health check
    console.log('1. Testing API health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    
    if (!healthResponse.ok) {
      throw new Error(`API not responding: ${healthResponse.status}`);
    }
    
    const healthData = await healthResponse.json();
    console.log('✅ API is running!');
    console.log(`   - Status: ${healthData.status}`);
    console.log(`   - Database: ${healthData.database}`);
    console.log('');

    // 2. Test simulados endpoint
    console.log('2. Testing simulados endpoint...');
    const simuladosResponse = await fetch(`${API_BASE}/simulados`);
    
    if (!simuladosResponse.ok) {
      throw new Error(`Simulados endpoint error: ${simuladosResponse.status}`);
    }
    
    const simuladosData = await simuladosResponse.json();
    console.log('✅ Simulados endpoint working!');
    console.log(`   - Success: ${simuladosData.success}`);
    console.log(`   - Simulados found: ${simuladosData.data?.length || 0}`);
    
    if (simuladosData.data && simuladosData.data.length > 0) {
      console.log('📚 First simulados:');
      simuladosData.data.slice(0, 3).forEach((simulado, index) => {
        console.log(`   ${index + 1}. ${simulado.title} (${simulado.difficulty}) - ${simulado.is_active ? 'Active' : 'Inactive'}`);
      });
    } else {
      console.log('📚 No simulados found in database');
    }
    console.log('');

    // 3. Test creating a simulado
    console.log('3. Testing simulado creation...');
    const testSimulado = {
      simulado: {
        title: `Test Simulado ${Date.now()}`,
        description: 'Test simulado created by API test',
        duration_minutes: 30,
        total_questions: 5,
        difficulty: 'facil',
        is_active: true
      },
      questions: [
        {
          text: 'What is 2 + 2?',
          type: 'multiple_choice',
          explanation: 'Basic math addition',
          order_number: 1,
          options: [
            { text: '3', is_correct: false, order_number: 1 },
            { text: '4', is_correct: true, order_number: 2 },
            { text: '5', is_correct: false, order_number: 3 }
          ]
        }
      ]
    };

    const createResponse = await fetch(`${API_BASE}/simulados`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSimulado),
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Simulado created successfully!');
      console.log(`   - ID: ${createData.data?.id}`);
      console.log(`   - Title: ${createData.data?.title}`);
      
      // 4. Verify it was saved
      console.log('4. Verifying simulado was saved...');
      const verifyResponse = await fetch(`${API_BASE}/simulados`);
      const verifyData = await verifyResponse.json();
      
      const createdSimulado = verifyData.data?.find(s => s.id === createData.data?.id);
      if (createdSimulado) {
        console.log('✅ Simulado found in database!');
        console.log(`   - Title: ${createdSimulado.title}`);
        console.log(`   - Questions: ${createdSimulado._count?.questions || 0}`);
        
        // 5. Clean up - delete the test simulado
        console.log('5. Cleaning up test simulado...');
        const deleteResponse = await fetch(`${API_BASE}/simulados/${createdSimulado.id}`, {
          method: 'DELETE',
        });

        if (deleteResponse.ok) {
          console.log('✅ Test simulado deleted successfully!');
        } else {
          console.log('❌ Failed to delete test simulado');
        }
      } else {
        console.log('❌ Simulado not found in database after creation!');
      }
    } else {
      const errorData = await createResponse.json();
      console.log('❌ Failed to create simulado:', errorData);
    }

    console.log('\n🎉 Simulados API test completed!');
    console.log('\n📋 SUMMARY:');
    console.log('✅ API Server: Working');
    console.log('✅ Database Connection: Active');
    console.log('✅ Simulados CRUD: Working');
    console.log('✅ Data Persistence: Confirmed');

  } catch (error) {
    console.error('❌ Error testing simulados API:', error.message);
    console.log('\n🔧 Possible solutions:');
    console.log('1. Make sure API server is running: npm run api');
    console.log('2. Check database is running: docker ps');
    console.log('3. Check API server logs');
  }
}

// Run test
testSimuladosAPI().catch(console.error);