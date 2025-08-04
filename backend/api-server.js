// Simple API server to connect frontend to PostgreSQL
const express = require('express');
const cors = require('cors');
const postgres = require('postgres');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const sql = postgres({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'hemera_db',
  username: process.env.DB_USER || 'hemera_user',
  password: process.env.DB_PASSWORD || 'hemera_password',
  ssl: false,
  max: 20,
});

// Test database connection
async function testConnection() {
  try {
    await sql`SELECT 1`;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Routes

// Health check
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({ 
    status: 'ok', 
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await sql`
      SELECT 
        p.id,
        p.user_id,
        p.name,
        p.email,
        p.phone,
        p.department,
        p.job_position,
        p.manager_name,
        p.employee_id,
        p.start_date,
        p.role,
        p.is_active,
        p.last_login,
        p.created_at
      FROM profiles p
      ORDER BY p.name
    `;
    
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get departments
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await sql`
      SELECT id, name, description, manager_id, is_active
      FROM departments
      WHERE is_active = true
      ORDER BY name
    `;
    
    res.json({ success: true, data: departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;
    
    // Call the stored procedure to create user
    const result = await sql`
      SELECT create_user_with_profile(
        ${userData.email},
        ${userData.password},
        ${userData.name},
        ${userData.phone || null},
        ${userData.role}::user_role,
        ${userData.department || null},
        ${userData.job_position || null},
        ${userData.manager_id || null},
        ${userData.employee_id || null},
        ${userData.start_date || new Date().toISOString().split('T')[0]},
        ${userData.birth_date || null}
      ) as result
    `;
    
    res.json({ success: true, data: result[0].result });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = req.body;
    
    const result = await sql`
      UPDATE profiles 
      SET ${sql(userData, 'name', 'email', 'phone', 'department', 'job_position', 'employee_id', 'role', 'is_active')},
          updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user status
app.patch('/api/users/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;
    
    const result = await sql`
      UPDATE profiles 
      SET is_active = ${is_active}, updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete user (soft delete)
app.delete('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await sql`
      UPDATE profiles 
      SET is_active = false, updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create department
app.post('/api/departments', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const result = await sql`
      INSERT INTO departments (name, description)
      VALUES (${name}, ${description})
      RETURNING *
    `;
    
    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SIMULADOS ENDPOINTS ====================

// Get all simulados
app.get('/api/simulados', async (req, res) => {
  try {
    console.log('🔄 Fetching simulados from database...');
    
    // First, try a simple query to see if the table exists and has data
    const simulados = await sql`
      SELECT * FROM simulados 
      ORDER BY created_at DESC
    `;
    
    console.log('✅ Found', simulados.length, 'simulados');
    
    // For each simulado, get counts separately to avoid complex joins
    const formattedSimulados = [];
    
    for (const simulado of simulados) {
      try {
        // Get question count
        const questionCount = await sql`
          SELECT COUNT(*) as count FROM questoes WHERE simulado_id = ${simulado.id}
        `;
        
        // Get attempt count
        const attemptCount = await sql`
          SELECT COUNT(*) as count FROM simulado_attempts WHERE simulado_id = ${simulado.id}
        `;
        
        formattedSimulados.push({
          ...simulado,
          _count: {
            questions: parseInt(questionCount[0].count) || 0,
            attempts: parseInt(attemptCount[0].count) || 0
          }
        });
      } catch (countError) {
        console.warn('Warning getting counts for simulado', simulado.id, ':', countError.message);
        // Add simulado without counts if there's an error
        formattedSimulados.push({
          ...simulado,
          _count: {
            questions: 0,
            attempts: 0
          }
        });
      }
    }
    
    console.log('✅ Formatted', formattedSimulados.length, 'simulados with counts');
    res.json({ success: true, data: formattedSimulados });
    
  } catch (error) {
    console.error('❌ Error fetching simulados:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create simulado with questions
app.post('/api/simulados', async (req, res) => {
  try {
    const { simulado, questions } = req.body;
    
    // Start transaction
    await sql.begin(async sql => {
      // Insert simulado
      const [newSimulado] = await sql`
        INSERT INTO simulados (
          title, description, duration_minutes, total_questions, difficulty, is_active
        ) VALUES (
          ${simulado.title},
          ${simulado.description},
          ${simulado.duration_minutes},
          ${simulado.total_questions},
          ${simulado.difficulty},
          ${simulado.is_active}
        )
        RETURNING *
      `;
      
      // Insert questions if provided
      if (questions && questions.length > 0) {
        for (const question of questions) {
          const [newQuestion] = await sql`
            INSERT INTO questoes (
              simulado_id, question_text, question_type, explanation, order_number
            ) VALUES (
              ${newSimulado.id},
              ${question.text},
              ${question.type},
              ${question.explanation || ''},
              ${question.order_number}
            )
            RETURNING *
          `;
          
          // Insert options if it's multiple choice
          if (question.type === 'multiple_choice' && question.options && question.options.length > 0) {
            const optionsData = question.options.map(option => [
              newQuestion.id,
              option.text,
              option.is_correct,
              option.order_number
            ]);
            
            await sql`
              INSERT INTO opcoes_resposta (questao_id, option_text, is_correct, order_number)
              SELECT * FROM ${sql(optionsData)}
            `;
          }
        }
      }
      
      res.json({ success: true, data: newSimulado });
    });
    
  } catch (error) {
    console.error('Error creating simulado:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update simulado
app.put('/api/simulados/:simuladoId', async (req, res) => {
  try {
    const { simuladoId } = req.params;
    const { simulado, questions } = req.body;
    
    await sql.begin(async sql => {
      // Update simulado
      const [updatedSimulado] = await sql`
        UPDATE simulados 
        SET 
          title = ${simulado.title},
          description = ${simulado.description},
          duration_minutes = ${simulado.duration_minutes},
          total_questions = ${simulado.total_questions},
          difficulty = ${simulado.difficulty},
          is_active = ${simulado.is_active},
          updated_at = NOW()
        WHERE id = ${simuladoId}
        RETURNING *
      `;
      
      if (!updatedSimulado) {
        return res.status(404).json({ success: false, error: 'Simulado not found' });
      }
      
      // Delete existing questions and options
      await sql`DELETE FROM opcoes_resposta WHERE questao_id IN (SELECT id FROM questoes WHERE simulado_id = ${simuladoId})`;
      await sql`DELETE FROM questoes WHERE simulado_id = ${simuladoId}`;
      
      // Insert new questions
      if (questions && questions.length > 0) {
        for (const question of questions) {
          const [newQuestion] = await sql`
            INSERT INTO questoes (
              simulado_id, question_text, question_type, explanation, order_number
            ) VALUES (
              ${simuladoId},
              ${question.text},
              ${question.type},
              ${question.explanation || ''},
              ${question.order_number}
            )
            RETURNING *
          `;
          
          // Insert options if it's multiple choice
          if (question.type === 'multiple_choice' && question.options && question.options.length > 0) {
            const optionsData = question.options.map(option => [
              newQuestion.id,
              option.text,
              option.is_correct,
              option.order_number
            ]);
            
            await sql`
              INSERT INTO opcoes_resposta (questao_id, option_text, is_correct, order_number)
              SELECT * FROM ${sql(optionsData)}
            `;
          }
        }
      }
      
      res.json({ success: true, data: updatedSimulado });
    });
    
  } catch (error) {
    console.error('Error updating simulado:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update simulado status
app.patch('/api/simulados/:simuladoId/status', async (req, res) => {
  try {
    const { simuladoId } = req.params;
    const { is_active } = req.body;
    
    const [result] = await sql`
      UPDATE simulados 
      SET is_active = ${is_active}, updated_at = NOW()
      WHERE id = ${simuladoId}
      RETURNING *
    `;
    
    if (!result) {
      return res.status(404).json({ success: false, error: 'Simulado not found' });
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating simulado status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete simulado
app.delete('/api/simulados/:simuladoId', async (req, res) => {
  try {
    const { simuladoId } = req.params;
    
    await sql.begin(async sql => {
      // Delete options first
      await sql`DELETE FROM opcoes_resposta WHERE questao_id IN (SELECT id FROM questoes WHERE simulado_id = ${simuladoId})`;
      
      // Delete questions
      await sql`DELETE FROM questoes WHERE simulado_id = ${simuladoId}`;
      
      // Delete simulado
      const [result] = await sql`
        DELETE FROM simulados 
        WHERE id = ${simuladoId}
        RETURNING *
      `;
      
      if (!result) {
        return res.status(404).json({ success: false, error: 'Simulado not found' });
      }
      
      res.json({ success: true, message: 'Simulado deleted successfully' });
    });
    
  } catch (error) {
    console.error('Error deleting simulado:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get questions for a simulado
app.get('/api/simulados/:simuladoId/questions', async (req, res) => {
  try {
    const { simuladoId } = req.params;
    
    const questions = await sql`
      SELECT 
        q.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', o.id,
              'text', o.option_text,
              'is_correct', o.is_correct,
              'order_number', o.order_number
            ) ORDER BY o.order_number
          ) FILTER (WHERE o.id IS NOT NULL),
          '[]'::json
        ) as options
      FROM questoes q
      LEFT JOIN opcoes_resposta o ON q.id = o.questao_id
      WHERE q.simulado_id = ${simuladoId}
      GROUP BY q.id
      ORDER BY q.order_number
    `;
    
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      text: q.question_text,
      type: q.question_type,
      explanation: q.explanation,
      order_number: q.order_number,
      options: q.options || []
    }));
    
    res.json({ success: true, data: formattedQuestions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  
  // Test database connection on startup
  await testConnection();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await sql.end();
  process.exit(0);
});