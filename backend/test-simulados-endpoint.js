// Test simulados endpoint in isolation
const express = require('express');
const cors = require('cors');
const postgres = require('postgres');

const app = express();
const PORT = 3002; // Different port to avoid conflicts

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

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Test endpoint working' });
});

// Test simulados table exists
app.get('/api/simulados/test', async (req, res) => {
  try {
    console.log('🔄 Testing simulados table...');
    
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'simulados'
      );
    `;
    
    console.log('✅ Table exists check:', tableExists[0].exists);
    
    if (!tableExists[0].exists) {
      return res.json({ 
        success: false, 
        error: 'Simulados table does not exist',
        tableExists: false 
      });
    }
    
    // Try simple select
    const count = await sql`SELECT COUNT(*) as count FROM simulados`;
    console.log('✅ Simulados count:', count[0].count);
    
    res.json({ 
      success: true, 
      tableExists: true,
      count: parseInt(count[0].count)
    });
    
  } catch (error) {
    console.error('❌ Error testing simulados table:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Simplified simulados endpoint
app.get('/api/simulados', async (req, res) => {
  try {
    console.log('🔄 Fetching simulados...');
    
    // Simple query first
    const simulados = await sql`
      SELECT * FROM simulados 
      ORDER BY created_at DESC
    `;
    
    console.log('✅ Simulados fetched:', simulados.length);
    
    res.json({ success: true, data: simulados });
    
  } catch (error) {
    console.error('❌ Error fetching simulados:', error);
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
  console.log(`🚀 Test API Server running on http://localhost:${PORT}`);
  
  // Test database connection on startup
  await testConnection();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await sql.end();
  process.exit(0);
});