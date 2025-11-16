-- Add email and name columns to users table
ALTER TABLE users 
  ALTER COLUMN account_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS name VARCHAR(255);
