// Insert test simulados directly into database
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

async function insertTestSimulados() {
  try {
    console.log('🔄 Inserting test simulados...');

    // Insert first simulado
    const [simulado1] = await sql`
      INSERT INTO simulados (
        title, description, duration_minutes, total_questions, difficulty, is_active
      ) VALUES (
        'Simulado de Matemática Básica',
        'Teste seus conhecimentos em matemática básica',
        60,
        10,
        'medio',
        true
      )
      RETURNING *
    `;

    console.log('✅ Created simulado 1:', simulado1.title);

    // Insert questions for simulado 1
    const [question1] = await sql`
      INSERT INTO questoes (
        simulado_id, question_text, question_type, explanation, order_number
      ) VALUES (
        ${simulado1.id},
        'Quanto é 2 + 2?',
        'multiple_choice',
        'Soma básica de números inteiros',
        1
      )
      RETURNING *
    `;

    // Insert options for question 1
    await sql`
      INSERT INTO opcoes_resposta (questao_id, option_text, is_correct, order_number)
      VALUES 
        (${question1.id}, '3', false, 1),
        (${question1.id}, '4', true, 2),
        (${question1.id}, '5', false, 3),
        (${question1.id}, '6', false, 4)
    `;

    // Insert second simulado
    const [simulado2] = await sql`
      INSERT INTO simulados (
        title, description, duration_minutes, total_questions, difficulty, is_active
      ) VALUES (
        'Simulado de Português',
        'Avalie seus conhecimentos em língua portuguesa',
        45,
        8,
        'facil',
        true
      )
      RETURNING *
    `;

    console.log('✅ Created simulado 2:', simulado2.title);

    // Insert questions for simulado 2
    const [question2] = await sql`
      INSERT INTO questoes (
        simulado_id, question_text, question_type, explanation, order_number
      ) VALUES (
        ${simulado2.id},
        'Qual é o plural de "cidadão"?',
        'multiple_choice',
        'Regra de formação do plural',
        1
      )
      RETURNING *
    `;

    // Insert options for question 2
    await sql`
      INSERT INTO opcoes_resposta (questao_id, option_text, is_correct, order_number)
      VALUES 
        (${question2.id}, 'cidadãos', true, 1),
        (${question2.id}, 'cidadões', false, 2),
        (${question2.id}, 'cidadans', false, 3)
    `;

    // Insert third simulado (inactive)
    const [simulado3] = await sql`
      INSERT INTO simulados (
        title, description, duration_minutes, total_questions, difficulty, is_active
      ) VALUES (
        'Simulado Avançado de Ciências',
        'Desafie-se com questões avançadas de ciências',
        90,
        15,
        'dificil',
        false
      )
      RETURNING *
    `;

    console.log('✅ Created simulado 3:', simulado3.title);

    // Verify insertion
    const allSimulados = await sql`
      SELECT 
        s.*,
        COUNT(q.id) as question_count
      FROM simulados s
      LEFT JOIN questoes q ON s.id = q.simulado_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `;

    console.log('\n📚 All simulados in database:');
    allSimulados.forEach((s, i) => {
      console.log(`${i + 1}. ${s.title} (${s.difficulty}) - ${s.is_active ? 'Active' : 'Inactive'} - ${s.question_count} questions`);
    });

    console.log('\n✅ Test simulados inserted successfully!');

  } catch (error) {
    console.error('❌ Error inserting test simulados:', error);
  } finally {
    await sql.end();
  }
}

insertTestSimulados();