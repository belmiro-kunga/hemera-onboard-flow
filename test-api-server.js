// Test if api-server.js can start
console.log('Testing api-server.js startup...');

try {
  const express = require('express');
  const cors = require('cors');
  const postgres = require('postgres');
  
  console.log('✅ All dependencies loaded successfully');
  
  // Test database connection
  const sql = postgres({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'hemera_db',
    username: process.env.DB_USER || 'hemera_user',
    password: process.env.DB_PASSWORD || 'hemera_password',
    ssl: false,
    max: 20,
  });
  
  console.log('✅ Database connection object created');
  
  // Test simple query
  sql`SELECT 1 as test`.then(result => {
    console.log('✅ Database query successful:', result);
    sql.end();
  }).catch(error => {
    console.error('❌ Database query failed:', error);
    sql.end();
  });
  
} catch (error) {
  console.error('❌ Error loading dependencies:', error);
}