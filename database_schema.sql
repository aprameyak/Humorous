-- Database schema for Humorous app
-- Run these commands in your Supabase SQL editor

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create joke_reactions table
CREATE TABLE IF NOT EXISTS joke_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joke_id TEXT NOT NULL,
  reaction TEXT CHECK (reaction IN ('like', 'dislike', 'view')),
  humor_style TEXT NOT NULL,
  reaction_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_joke_reactions_user_id ON joke_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_joke_reactions_humor_style ON joke_reactions(humor_style);
CREATE INDEX IF NOT EXISTS idx_joke_reactions_reaction ON joke_reactions(reaction);

-- Enable Row Level Security (RLS)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE joke_reactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see/modify their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see/modify their own reactions
CREATE POLICY "Users can view own reactions" ON joke_reactions
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own reactions" ON joke_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
