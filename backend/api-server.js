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