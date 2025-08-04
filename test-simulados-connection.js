// Test simulados database connection
import postgres from 'postgres';

const sql = postgres({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'hemera_db',
  username: process.env.DB_USER || 'hemera_user',
  password: process.env.DB_PASSWORD || 'hemera_password',
  ssl: false,
  max: 20,
});

async function testSimuladosTable() {
  try {
    console.log('Testing simulados table...');
    
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'simulados'
      );
    `;
    console.log('Table exists:', tableExists[0].exists);
    
    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'simulados'
      ORDER BY ordinal_position;
    `;
    console.log('Table structure:', columns);
    
    // Try to select from simulados
    const simulados = await sql`
      SELECT 
        s.*,
        COUNT(DISTINCT q.id) as question_count,
        COUNT(DISTINCT sa.id) as attempt_count
      FROM simulados s
      LEFT JOIN questoes q ON s.id = q.simulado_id
      LEFT JOIN simulado_attempts sa ON s.id = sa.simulado_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `;
    
    console.log('Simulados found:', simulados.length);
    console.log('Simulados data:', simulados);
    
  } catch (error) {
    console.error('Error testing simulados:', error);
  } finally {
    await sql.end();
  }
}

testSimuladosTable();