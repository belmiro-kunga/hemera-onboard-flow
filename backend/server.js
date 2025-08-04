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
