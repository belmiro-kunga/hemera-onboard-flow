// Backend API server for Hemera LMS - User Management (v2 - Updated for new schema)
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API and database are healthy',
    timestamp: new Date().toISOString()
  });
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        name,
        email,
        role,
        department,
        birthday,
        status,
        last_login,
        created_at,
        updated_at
      FROM public.users
      ORDER BY name, email
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

// Get single user by ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT 
        id,
        name,
        email,
        role,
        department,
        birthday,
        status,
        last_login,
        created_at,
        updated_at
      FROM public.users
      WHERE id = $1
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
      password = generateRandomPassword(), 
      role = 'funcionario',
      department = null,
      birthday = null,
      status = 'active'
    } = req.body;
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO public.users (
        name, 
        email, 
        password_hash, 
        role, 
        department, 
        birthday, 
        status
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await client.query(query, [
      name, 
      email, 
      hashedPassword, 
      role, 
      department, 
      birthday, 
      status
    ]);
    
    await client.query('COMMIT');
    
    const newUser = result.rows[0];
    // Don't return the password hash
    delete newUser.password_hash;
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully',
      generatedPassword: password // Only returned for admin use
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating user:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
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
      password,
      role,
      department,
      birthday,
      status
    } = req.body;
    
    // First, get the current user data
    const getUserQuery = 'SELECT * FROM public.users WHERE id = $1';
    const userResult = await client.query(getUserQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const currentUser = userResult.rows[0];
    
    // Hash the new password if provided
    let hashedPassword = currentUser.password_hash;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    
    const query = `
      UPDATE public.users
      SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        password_hash = COALESCE($3, password_hash),
        role = COALESCE($4, role),
        department = COALESCE($5, department),
        birthday = COALESCE($6, birthday),
        status = COALESCE($7, status),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    
    const result = await client.query(query, [
      name || currentUser.name,
      email || currentUser.email,
      hashedPassword,
      role || currentUser.role,
      department !== undefined ? department : currentUser.department,
      birthday !== undefined ? birthday : currentUser.birthday,
      status || currentUser.status,
      userId
    ]);
    
    await client.query('COMMIT');
    
    const updatedUser = result.rows[0];
    // Don't return the password hash
    delete updatedUser.password_hash;
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating user:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Delete user
app.delete('/api/users/:userId', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { userId } = req.params;
    
    // First, check if user exists
    const checkQuery = 'SELECT id FROM public.users WHERE id = $1';
    const checkResult = await client.query(checkQuery, [userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Delete the user
    const deleteQuery = 'DELETE FROM public.users WHERE id = $1 RETURNING id';
    await client.query(deleteQuery, [userId]);
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting user:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Import users (bulk create)
app.post('/api/users/import', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { users } = req.body;
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No users provided for import'
      });
    }
    
    const importedUsers = [];
    const errors = [];
    
    for (const [index, user] of users.entries()) {
      try {
        const { 
          name, 
          email, 
          role = 'funcionario',
          department = null,
          birthday = null,
          status = 'active'
        } = user;
        
        // Generate a random password for imported users
        const password = generateRandomPassword(12);
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = `
          INSERT INTO public.users (
            name, 
            email, 
            password_hash, 
            role, 
            department, 
            birthday, 
            status
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id, name, email, role, department, birthday, status, created_at
        `;
        
        const result = await client.query(query, [
          name, 
          email, 
          hashedPassword, 
          role, 
          department, 
          birthday, 
          status
        ]);
        
        importedUsers.push({
          ...result.rows[0],
          generatedPassword: password // Include generated password in response
        });
      } catch (error) {
        // Log the error but continue with other users
        errors.push({
          index,
          email: user.email,
          error: error.code === '23505' ? 'Email already exists' : error.message
        });
      }
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      data: {
        imported: importedUsers,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `Successfully imported ${importedUsers.length} user(s)` + 
               (errors.length > 0 ? ` with ${errors.length} error(s)` : '')
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error importing users:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Hemera API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
