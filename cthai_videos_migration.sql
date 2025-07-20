-- Drop table if exists (for development)
DROP TABLE IF EXISTS cthai_videos CASCADE;

-- Create videos table for storing Cloudinary URLs
CREATE TABLE cthai_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  resolution TEXT NOT NULL,
  duration TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by user
CREATE INDEX idx_cthai_videos_user_id ON cthai_videos(user_id);

-- Create index for faster queries by creation date
CREATE INDEX idx_cthai_videos_created_at ON cthai_videos(created_at DESC);

-- Enable RLS
ALTER TABLE cthai_videos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own videos" ON cthai_videos;
DROP POLICY IF EXISTS "Users can insert their own videos" ON cthai_videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON cthai_videos;

-- Create policy to allow users to see only their own videos
CREATE POLICY "Users can view their own videos" ON cthai_videos
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own videos
CREATE POLICY "Users can insert their own videos" ON cthai_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own videos
CREATE POLICY "Users can delete their own videos" ON cthai_videos
  FOR DELETE USING (auth.uid() = user_id);

-- Create policy to allow users to update their own videos
CREATE POLICY "Users can update their own videos" ON cthai_videos
  FOR UPDATE USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE cthai_videos IS 'Stores AI-generated videos with Cloudinary URLs'; 