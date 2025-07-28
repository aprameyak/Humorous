-- Create seen_jokes table to track jokes users have already seen
CREATE TABLE IF NOT EXISTS seen_jokes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joke_hash TEXT NOT NULL,
    humor_style TEXT NOT NULL,
    seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure each user can only see each joke once
    UNIQUE(user_id, joke_hash)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_seen_jokes_user_id ON seen_jokes(user_id);
CREATE INDEX IF NOT EXISTS idx_seen_jokes_user_hash ON seen_jokes(user_id, joke_hash);
CREATE INDEX IF NOT EXISTS idx_seen_jokes_humor_style ON seen_jokes(humor_style);
CREATE INDEX IF NOT EXISTS idx_seen_jokes_seen_at ON seen_jokes(seen_at);

-- Enable Row Level Security (RLS)
ALTER TABLE seen_jokes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own seen jokes
CREATE POLICY "Users can view their own seen jokes" ON seen_jokes
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own seen jokes
CREATE POLICY "Users can insert their own seen jokes" ON seen_jokes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own seen jokes
CREATE POLICY "Users can update their own seen jokes" ON seen_jokes
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own seen jokes
CREATE POLICY "Users can delete their own seen jokes" ON seen_jokes
    FOR DELETE USING (auth.uid() = user_id);

-- Optional: Create a function to clean up old seen jokes (older than 6 months)
-- This prevents the table from growing infinitely
CREATE OR REPLACE FUNCTION cleanup_old_seen_jokes()
RETURNS void AS $$
BEGIN
    DELETE FROM seen_jokes 
    WHERE seen_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup monthly
-- You can set this up in Supabase Edge Functions or using pg_cron if available
