-- Drop table if exists (for development)
DROP TABLE IF EXISTS cthai_audios CASCADE;

-- Create audios table for storing Cloudinary URLs
CREATE TABLE cthai_audios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  voice TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by user
CREATE INDEX idx_cthai_audios_user_id ON cthai_audios(user_id);

-- Create index for faster queries by creation date
CREATE INDEX idx_cthai_audios_created_at ON cthai_audios(created_at DESC);

-- Enable RLS
ALTER TABLE cthai_audios ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own audios" ON cthai_audios;
DROP POLICY IF EXISTS "Users can insert their own audios" ON cthai_audios;
DROP POLICY IF EXISTS "Users can delete their own audios" ON cthai_audios;

-- Create policy to allow users to see only their own audios
CREATE POLICY "Users can view their own audios" ON cthai_audios
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own audios
CREATE POLICY "Users can insert their own audios" ON cthai_audios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own audios
CREATE POLICY "Users can delete their own audios" ON cthai_audios
  FOR DELETE USING (auth.uid() = user_id);

-- Create policy to allow users to update their own audios
CREATE POLICY "Users can update their own audios" ON cthai_audios
  FOR UPDATE USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE cthai_audios IS 'Stores AI-generated audios with Cloudinary URLs'; 