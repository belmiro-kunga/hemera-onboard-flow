// Test creating a simulado
const testSimulado = {
  simulado: {
    title: 'Test Simulado API',
    description: 'Test simulado created via API',
    duration_minutes: 30,
    total_questions: 2,
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
    },
    {
      text: 'What is the capital of Brazil?',
      type: 'multiple_choice',
      explanation: 'Brasília is the capital of Brazil',
      order_number: 2,
      options: [
        { text: 'São Paulo', is_correct: false, order_number: 1 },
        { text: 'Rio de Janeiro', is_correct: false, order_number: 2 },
        { text: 'Brasília', is_correct: true, order_number: 3 }
      ]
    }
  ]
};

async function testCreateSimulado() {
  try {
    console.log('🔄 Testing simulado creation...');
    
    const response = await fetch('http://localhost:3001/api/simulados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSimulado),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Simulado created successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    // Now test fetching all simulados
    console.log('\n🔄 Testing simulados fetch...');
    const fetchResponse = await fetch('http://localhost:3001/api/simulados');
    const fetchResult = await fetchResponse.json();
    
    console.log('✅ Simulados fetched successfully!');
    console.log('Found simulados:', fetchResult.data.length);
    
    if (fetchResult.data.length > 0) {
      console.log('First simulado:', JSON.stringify(fetchResult.data[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCreateSimulado();