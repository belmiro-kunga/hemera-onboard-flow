-- Initialize database with extensions and basic setup
-- This script runs when the PostgreSQL container is first created

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create auth schema for authentication functions
CREATE SCHEMA IF NOT EXISTS auth;

-- Create a function to get current user ID (similar to Supabase auth.uid())
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    current_setting('app.current_user_id', true)::UUID,
    NULL
  );
$$;

-- Create a function to set current user ID
CREATE OR REPLACE FUNCTION auth.set_user_id(user_id UUID)
RETURNS VOID
LANGUAGE SQL
AS $$
  SELECT set_config('app.current_user_id', user_id::TEXT, true);
$$;

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_confirmed BOOLEAN DEFAULT false,
  last_sign_in_at TIMESTAMP WITH TIME ZONE
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION auth.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO hemera_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO hemera_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO hemera_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA auth TO hemera_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO hemera_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON SEQUENCES TO hemera_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON FUNCTIONS TO hemera_user;