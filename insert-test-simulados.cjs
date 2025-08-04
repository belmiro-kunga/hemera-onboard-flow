// Insert test simulados data
const postgres = require('postgres');

const sql = postgres({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'hemera_db',
  username: process.env.DB_USER || 'hemera_user',
  password: process.env.DB_PASSWORD || 'hemera_password',
  ssl: false,
  max: 20,
});

async function insertTestData() {
  try {
    console.log('🔄 Inserting test simulados...');
    
    // Insert test simulados
    const simulados = [
      {
        title: 'Simulado de Matemática Básica',
        description: 'Teste seus conhecimentos em matemática básica com questões de aritmética, álgebra e geometria.',
        duration_minutes: 60,
        total_questions: 10,
        difficulty: 'medio',
        is_active: true
      },
      {
        title: 'Simulado de Português',
        description: 'Avalie seus conhecimentos em língua portuguesa com questões de gramática, interpretação de texto e redação.',
        duration_minutes: 45,
        total_questions: 8,
        difficulty: 'facil',
        is_active: true
      },
      {
        title: 'Simulado Avançado de Ciências',
        description: 'Desafie-se com questões avançadas de física, química e biologia.',
        duration_minutes: 90,
        total_questions: 15,
        difficulty: 'dificil',
        is_active: false
      }
    ];
    
    for (const simulado of simulados) {
      const result = await sql`
        INSERT INTO simulados (title, description, duration_minutes, total_questions, difficulty, is_active)
        VALUES (${simulado.title}, ${simulado.description}, ${simulado.duration_minutes}, ${simulado.total_questions}, ${simulado.difficulty}, ${simulado.is_active})
        RETURNING id, title
      `;
      
      console.log('✅ Inserted simulado:', result[0].title, '(ID:', result[0].id + ')');
      
      // Insert some test questions for each simulado
      const questions = [
        {
          question_text: `Questão de exemplo para ${simulado.title}`,
          question_type: 'multiple_choice',
          explanation: 'Esta é uma questão de exemplo para demonstrar o sistema.',
          order_number: 1
        },
        {
          question_text: `Segunda questão para ${simulado.title}`,
          question_type: 'multiple_choice', 
          explanation: 'Outra questão de exemplo.',
          order_number: 2
        }
      ];
      
      for (const question of questions) {
        const questionResult = await sql`
          INSERT INTO questoes (simulado_id, question_text, question_type, explanation, order_number)
          VALUES (${result[0].id}, ${question.question_text}, ${question.question_type}, ${question.explanation}, ${question.order_number})
          RETURNING id
        `;
        
        // Insert options for multiple choice questions
        if (question.question_type === 'multiple_choice') {
          const options = [
            { option_text: 'Opção A', is_correct: true, order_number: 1 },
            { option_text: 'Opção B', is_correct: false, order_number: 2 },
            { option_text: 'Opção C', is_correct: false, order_number: 3 },
            { option_text: 'Opção D', is_correct: false, order_number: 4 }
          ];
          
          for (const option of options) {
            await sql`
              INSERT INTO opcoes_resposta (questao_id, option_text, is_correct, order_number)
              VALUES (${questionResult[0].id}, ${option.option_text}, ${option.is_correct}, ${option.order_number})
            `;
          }
        }
      }
    }
    
    console.log('✅ Test data inserted successfully!');
    
    // Verify the data
    const count = await sql`SELECT COUNT(*) as count FROM simulados`;
    console.log('📊 Total simulados in database:', count[0].count);
    
  } catch (error) {
    console.error('❌ Error inserting test data:', error);
  } finally {
    await sql.end();
  }
}

insertTestData();