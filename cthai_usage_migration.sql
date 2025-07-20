-- Drop table if exists (for development)
DROP TABLE IF EXISTS cthai_usage CASCADE;

-- Create usage tracking table
CREATE TABLE cthai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('image', 'video', 'audio', 'vision', 'chat')),
  usage_count INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 10,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature_type)
);

-- Create index for faster queries by user
CREATE INDEX idx_cthai_usage_user_id ON cthai_usage(user_id);

-- Create index for faster queries by feature type
CREATE INDEX idx_cthai_usage_feature_type ON cthai_usage(feature_type);

-- Create index for faster queries by last reset date
CREATE INDEX idx_cthai_usage_last_reset_date ON cthai_usage(last_reset_date);

-- Enable RLS
ALTER TABLE cthai_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own usage" ON cthai_usage;
DROP POLICY IF EXISTS "Users can insert their own usage" ON cthai_usage;
DROP POLICY IF EXISTS "Users can update their own usage" ON cthai_usage;
DROP POLICY IF EXISTS "Users can delete their own usage" ON cthai_usage;

-- Create policy to allow users to see only their own usage
CREATE POLICY "Users can view their own usage" ON cthai_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own usage
CREATE POLICY "Users can insert their own usage" ON cthai_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own usage
CREATE POLICY "Users can update their own usage" ON cthai_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own usage
CREATE POLICY "Users can delete their own usage" ON cthai_usage
  FOR DELETE USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE cthai_usage IS 'Stores user usage tracking for free tier limits with daily resets';

-- Create function to reset daily usage
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void AS $$
BEGIN
  UPDATE cthai_usage 
  SET usage_count = 0, 
      last_reset_date = CURRENT_DATE,
      updated_at = NOW()
  WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically reset usage daily
CREATE OR REPLACE FUNCTION check_and_reset_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset usage if it's a new day
  IF NEW.last_reset_date < CURRENT_DATE THEN
    NEW.usage_count := 0;
    NEW.last_reset_date := CURRENT_DATE;
    NEW.updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_check_and_reset_usage ON cthai_usage;
CREATE TRIGGER trigger_check_and_reset_usage
  BEFORE INSERT OR UPDATE ON cthai_usage
  FOR EACH ROW
  EXECUTE FUNCTION check_and_reset_usage(); 