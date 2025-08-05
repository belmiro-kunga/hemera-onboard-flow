// Backend API server for Hemera LMS - User Management
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'hemera_db',
  user: 'hemera_user',
  password: 'hemera_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err);
    process.exit(1);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Helper function to generate random password
function generateRandomPassword(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// API Routes

// Get all users with profiles
app.get('/api/users', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.id as user_id,
        p.full_name as name,
        u.email,
        p.phone,
        CASE 
          WHEN p.job_position ILIKE '%admin%' OR p.job_position ILIKE '%gerente%' OR p.job_position ILIKE '%diretor%' THEN 'admin'
          ELSE 'funcionario'
        END as role,
        p.department,
        p.job_position,
        p.full_name as manager_name,
        '' as employee_id,
        u.created_at::date::text as start_date,
        COALESCE(u.email_confirmed, true) as is_active,
        u.last_sign_in_at as last_login,
        u.created_at,
        u.updated_at
      FROM auth.users u
      LEFT JOIN public.profiles p ON u.id = p.user_id
      ORDER BY p.full_name, u.email
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user by ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT 
        u.id,
        u.id as user_id,
        p.full_name as name,
        u.email,
        p.phone,
        CASE 
          WHEN p.job_position ILIKE '%admin%' OR p.job_position ILIKE '%gerente%' OR p.job_position ILIKE '%diretor%' THEN 'admin'
          ELSE 'funcionario'
        END as role,
        p.department,
        p.job_position,
        p.full_name as manager_name,
        '' as employee_id,
        u.created_at::date::text as start_date,
        COALESCE(u.email_confirmed, true) as is_active,
        u.last_sign_in_at as last_login,
        u.created_at,
        u.updated_at
      FROM auth.users u
      LEFT JOIN public.profiles p ON u.id = p.user_id
      WHERE u.id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      name,
      email,
      phone,
      department,
      job_position,
      role = 'funcionario'
    } = req.body;
    
    // Generate random password
    const tempPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Create user in auth.users
    const userQuery = `
      INSERT INTO auth.users (id, email, password_hash, email_confirmed, created_at, updated_at)
      VALUES ($1, $2, $3, true, NOW(), NOW())
      RETURNING id
    `;
    
    const userId = uuidv4();
    const userResult = await client.query(userQuery, [userId, email, hashedPassword]);
    
    // Create profile
    const profileQuery = `
      INSERT INTO public.profiles (user_id, full_name, job_position, department, phone, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `;
    
    await client.query(profileQuery, [userId, name, job_position, department, phone]);
    
    await client.query('COMMIT');
    
    console.log(`✅ User created: ${name} (${email}) with temporary password: ${tempPassword}`);
    
    res.json({
      success: true,
      data: {
        user_id: userId,
        temporary_password: tempPassword
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating user:', error);
    
    if (error.code === '23505') { // Unique violation
      res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  } finally {
    client.release();
  }
});

// Update user
app.put('/api/users/:userId', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { userId } = req.params;
    const {
      name,
      email,
      phone,
      department,
      job_position
    } = req.body;
    
    // Update auth.users if email changed
    if (email) {
      const userQuery = `
        UPDATE auth.users 
        SET email = $1, updated_at = NOW()
        WHERE id = $2
      `;
      await client.query(userQuery, [email, userId]);
    }
    
    // Update profile
    const profileQuery = `
      UPDATE public.profiles 
      SET full_name = $1, job_position = $2, department = $3, phone = $4, updated_at = NOW()
      WHERE user_id = $5
    `;
    
    await client.query(profileQuery, [name, job_position, department, phone, userId]);
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'User updated successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating user:', error);
    
    if (error.code === '23505') { // Unique violation
      res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  } finally {
    client.release();
  }
});

// Update user status
app.patch('/api/users/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;
    
    const query = `
      UPDATE auth.users 
      SET email_confirmed = $1, updated_at = NOW()
      WHERE id = $2
    `;
    
    await pool.query(query, [is_active, userId]);
    
    res.json({
      success: true,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
    });
    
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete user (soft delete)
app.delete('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Soft delete by setting email_confirmed to false
    const query = `
      UPDATE auth.users 
      SET email_confirmed = false, updated_at = NOW()
      WHERE id = $1
    `;
    
    await pool.query(query, [userId]);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get departments
app.get('/api/departments', async (req, res) => {
  try {
    // Since we don't have a departments table, return common departments
    const departments = [
      { id: 'ti', name: 'TI', description: 'Tecnologia da Informação', is_active: true },
      { id: 'rh', name: 'RH', description: 'Recursos Humanos', is_active: true },
      { id: 'financeiro', name: 'Financeiro', description: 'Departamento Financeiro', is_active: true },
      { id: 'administracao', name: 'Administração', description: 'Administração Geral', is_active: true },
      { id: 'vendas', name: 'Vendas', description: 'Departamento de Vendas', is_active: true },
      { id: 'marketing', name: 'Marketing', description: 'Marketing e Comunicação', is_active: true }
    ];
    
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== SIMULADOS ENDPOINTS ====================

// Get all simulados
app.get('/api/simulados', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.duration_minutes,
        s.total_questions,
        s.difficulty,
        s.is_active,
        s.created_at,
        COUNT(DISTINCT sa.id) as attempts,
        COUNT(DISTINCT q.id) as questions
      FROM public.simulados s
      LEFT JOIN public.simulado_attempts sa ON s.id = sa.simulado_id
      LEFT JOIN public.questoes q ON s.id = q.simulado_id
      GROUP BY s.id, s.title, s.description, s.duration_minutes, s.total_questions, s.difficulty, s.is_active, s.created_at
      ORDER BY s.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    // Format the response to match the expected structure
    const simulados = result.rows.map(row => ({
      ...row,
      _count: {
        attempts: parseInt(row.attempts) || 0,
        questions: parseInt(row.questions) || 0
      }
    }));
    
    res.json({
      success: true,
      data: simulados
    });
  } catch (error) {
    console.error('Error fetching simulados:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get simulado by ID
app.get('/api/simulados/:simuladoId', async (req, res) => {
  try {
    const { simuladoId } = req.params;
    
    const query = `
      SELECT 
        s.*,
        COUNT(DISTINCT sa.id) as attempts,
        COUNT(DISTINCT q.id) as questions
      FROM public.simulados s
      LEFT JOIN public.simulado_attempts sa ON s.id = sa.simulado_id
      LEFT JOIN public.questoes q ON s.id = q.simulado_id
      WHERE s.id = $1
      GROUP BY s.id
    `;
    
    const result = await pool.query(query, [simuladoId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Simulado not found'
      });
    }
    
    const simulado = {
      ...result.rows[0],
      _count: {
        attempts: parseInt(result.rows[0].attempts) || 0,
        questions: parseInt(result.rows[0].questions) || 0
      }
    };
    
    res.json({
      success: true,
      data: simulado
    });
  } catch (error) {
    console.error('Error fetching simulado:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new simulado
app.post('/api/simulados', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { simulado, questions } = req.body;
    
    console.log('🆕 Creating new simulado');
    console.log('📝 Simulado data:', simulado);
    console.log('❓ Questions count:', questions ? questions.length : 0);
    
    const {
      title,
      description,
      duration_minutes,
      difficulty = 'medio',
      is_active = true
    } = simulado;
    
    // Create simulado
    const simuladoQuery = `
      INSERT INTO public.simulados (id, title, description, duration_minutes, total_questions, difficulty, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id
    `;
    
    const simuladoId = uuidv4();
    const totalQuestions = questions ? questions.length : 0;
    
    console.log('📊 Inserting simulado with data:', {
      id: simuladoId,
      title,
      description,
      duration_minutes,
      totalQuestions,
      difficulty,
      is_active
    });
    
    await client.query(simuladoQuery, [
      simuladoId,
      title,
      description,
      duration_minutes,
      totalQuestions,
      difficulty,
      is_active
    ]);
    
    // Create questions if provided
    if (questions && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionId = uuidv4();
        
        // Insert question
        const questionQuery = `
          INSERT INTO public.questoes (id, simulado_id, question_text, question_type, explanation, order_number, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `;
        
        await client.query(questionQuery, [
          questionId,
          simuladoId,
          question.text,
          question.type || 'multiple_choice',
          question.explanation || '',
          question.order_number || i + 1
        ]);
        
        // Insert options
        if (question.options && question.options.length > 0) {
          for (let j = 0; j < question.options.length; j++) {
            const option = question.options[j];
            const optionId = uuidv4();
            
            const optionQuery = `
              INSERT INTO public.opcoes_resposta (id, questao_id, option_text, is_correct, order_number, created_at)
              VALUES ($1, $2, $3, $4, $5, NOW())
            `;
            
            await client.query(optionQuery, [
              optionId,
              questionId,
              option.text,
              option.is_correct || false,
              option.order_number || j + 1
            ]);
          }
        }
      }
    }
    
    await client.query('COMMIT');
    
    console.log(`✅ Simulado created: ${title} with ${totalQuestions} questions`);
    
    res.json({
      success: true,
      data: {
        id: simuladoId
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating simulado:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Update simulado
app.put('/api/simulados/:simuladoId', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { simuladoId } = req.params;
    const { simulado, questions } = req.body;
    
    console.log('🔄 Updating simulado:', simuladoId);
    console.log('📝 Simulado data:', simulado);
    console.log('❓ Questions count:', questions ? questions.length : 0);
    
    const {
      title,
      description,
      duration_minutes,
      difficulty,
      is_active
    } = simulado;
    
    // Update simulado
    const simuladoQuery = `
      UPDATE public.simulados 
      SET title = $1, description = $2, duration_minutes = $3, difficulty = $4, total_questions = $5, is_active = $6, updated_at = NOW()
      WHERE id = $7
    `;
    
    const totalQuestions = questions ? questions.length : 0;
    
    await client.query(simuladoQuery, [
      title,
      description,
      duration_minutes,
      difficulty,
      totalQuestions,
      is_active !== undefined ? is_active : true,
      simuladoId
    ]);
    
    console.log('✅ Simulado basic data updated successfully');
    
    // Delete existing questions and options
    await client.query('DELETE FROM public.opcoes_resposta WHERE questao_id IN (SELECT id FROM public.questoes WHERE simulado_id = $1)', [simuladoId]);
    await client.query('DELETE FROM public.questoes WHERE simulado_id = $1', [simuladoId]);
    
    // Create new questions if provided
    if (questions && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionId = uuidv4();
        
        // Insert question
        const questionQuery = `
          INSERT INTO public.questoes (id, simulado_id, question_text, question_type, explanation, order_number, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `;
        
        await client.query(questionQuery, [
          questionId,
          simuladoId,
          question.text,
          question.type || 'multiple_choice',
          question.explanation || '',
          question.order_number || i + 1
        ]);
        
        // Insert options
        if (question.options && question.options.length > 0) {
          for (let j = 0; j < question.options.length; j++) {
            const option = question.options[j];
            const optionId = uuidv4();
            
            const optionQuery = `
              INSERT INTO public.opcoes_resposta (id, questao_id, option_text, is_correct, order_number, created_at)
              VALUES ($1, $2, $3, $4, $5, NOW())
            `;
            
            await client.query(optionQuery, [
              optionId,
              questionId,
              option.text,
              option.is_correct || false,
              option.order_number || j + 1
            ]);
          }
        }
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Simulado updated successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating simulado:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Update simulado status
app.patch('/api/simulados/:simuladoId/status', async (req, res) => {
  try {
    const { simuladoId } = req.params;
    const { is_active } = req.body;
    
    const query = `
      UPDATE public.simulados 
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2
    `;
    
    await pool.query(query, [is_active, simuladoId]);
    
    res.json({
      success: true,
      message: `Simulado ${is_active ? 'activated' : 'deactivated'} successfully`
    });
    
  } catch (error) {
    console.error('Error updating simulado status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete simulado
app.delete('/api/simulados/:simuladoId', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { simuladoId } = req.params;
    
    // Delete in correct order due to foreign key constraints
    await client.query('DELETE FROM public.opcoes_resposta WHERE questao_id IN (SELECT id FROM public.questoes WHERE simulado_id = $1)', [simuladoId]);
    await client.query('DELETE FROM public.questoes WHERE simulado_id = $1', [simuladoId]);
    await client.query('DELETE FROM public.simulado_attempts WHERE simulado_id = $1', [simuladoId]);
    await client.query('DELETE FROM public.simulados WHERE id = $1', [simuladoId]);
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Simulado deleted successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting simulado:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Get questions for a simulado
app.get('/api/simulados/:simuladoId/questions', async (req, res) => {
  try {
    const { simuladoId } = req.params;
    
    const questionsQuery = `
      SELECT 
        q.id,
        q.question_text as text,
        q.question_type as type,
        q.explanation,
        q.order_number
      FROM public.questoes q
      WHERE q.simulado_id = $1
      ORDER BY q.order_number
    `;
    
    const questionsResult = await pool.query(questionsQuery, [simuladoId]);
    
    // Get options for each question
    const questions = [];
    for (const question of questionsResult.rows) {
      const optionsQuery = `
        SELECT 
          o.id,
          o.option_text as text,
          o.is_correct,
          o.order_number
        FROM public.opcoes_resposta o
        WHERE o.questao_id = $1
        ORDER BY o.order_number
      `;
      
      const optionsResult = await pool.query(optionsQuery, [question.id]);
      
      questions.push({
        ...question,
        options: optionsResult.rows
      });
    }
    
    res.json({
      success: true,
      data: questions
    });
    
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1 as test');
    res.json({
      success: true,
      message: 'API and database are healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection failed'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Hemera API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down server...');
  await pool.end();
  process.exit(0);
});
