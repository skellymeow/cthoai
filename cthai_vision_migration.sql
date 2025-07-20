-- Drop table if exists (for development)
DROP TABLE IF EXISTS cthai_vision CASCADE;

-- Create vision table for storing image analysis results
CREATE TABLE cthai_vision (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by user
CREATE INDEX idx_cthai_vision_user_id ON cthai_vision(user_id);

-- Create index for faster queries by creation date
CREATE INDEX idx_cthai_vision_created_at ON cthai_vision(created_at DESC);

-- Enable RLS
ALTER TABLE cthai_vision ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own vision analyses" ON cthai_vision;
DROP POLICY IF EXISTS "Users can insert their own vision analyses" ON cthai_vision;
DROP POLICY IF EXISTS "Users can delete their own vision analyses" ON cthai_vision;

-- Create policy to allow users to see only their own vision analyses
CREATE POLICY "Users can view their own vision analyses" ON cthai_vision
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own vision analyses
CREATE POLICY "Users can insert their own vision analyses" ON cthai_vision
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own vision analyses
CREATE POLICY "Users can delete their own vision analyses" ON cthai_vision
  FOR DELETE USING (auth.uid() = user_id);

-- Create policy to allow users to update their own vision analyses
CREATE POLICY "Users can update their own vision analyses" ON cthai_vision
  FOR UPDATE USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE cthai_vision IS 'Stores AI vision analysis results with Cloudinary URLs'; 