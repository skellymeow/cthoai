-- Create images table for storing Cloudinary URLs
CREATE TABLE IF NOT EXISTS cthai_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  resolution TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_cthai_images_user_id ON cthai_images(user_id);

-- Create index for faster queries by creation date
CREATE INDEX IF NOT EXISTS idx_cthai_images_created_at ON cthai_images(created_at DESC);

-- Enable RLS
ALTER TABLE cthai_images ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own images
CREATE POLICY "Users can view their own images" ON cthai_images
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own images
CREATE POLICY "Users can insert their own images" ON cthai_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own images
CREATE POLICY "Users can delete their own images" ON cthai_images
  FOR DELETE USING (auth.uid() = user_id); 