-- Create jokes table to store all generated jokes globally
CREATE TABLE IF NOT EXISTS jokes (
    id BIGSERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    humor_style TEXT NOT NULL,
    joke_hash TEXT UNIQUE NOT NULL, -- Same hash function as seen_jokes
    source TEXT DEFAULT 'gemini', -- 'gemini', 'external_api', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Performance metrics
    total_views INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_dislikes INTEGER DEFAULT 0,
    like_ratio DECIMAL(5,4) DEFAULT 0.0, -- likes / (likes + dislikes)
    engagement_score DECIMAL(10,6) DEFAULT 0.0, -- Custom scoring algorithm
    
    -- Quality flags
    is_approved BOOLEAN DEFAULT true,
    is_flagged BOOLEAN DEFAULT false,
    quality_score DECIMAL(5,4) DEFAULT 0.5 -- AI-based quality assessment
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jokes_humor_style ON jokes(humor_style);
CREATE INDEX IF NOT EXISTS idx_jokes_engagement_score ON jokes(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_jokes_like_ratio ON jokes(like_ratio DESC);
CREATE INDEX IF NOT EXISTS idx_jokes_created_at ON jokes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jokes_hash ON jokes(joke_hash);
CREATE INDEX IF NOT EXISTS idx_jokes_performance ON jokes(engagement_score DESC, like_ratio DESC, total_views DESC);

-- Create user_joke_interactions table to track all user interactions
CREATE TABLE IF NOT EXISTS user_joke_interactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joke_id BIGINT NOT NULL REFERENCES jokes(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'dislike', 'share', 'skip')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate interactions of same type
    UNIQUE(user_id, joke_id, interaction_type)
);

-- Indexes for user interactions
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_joke_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_joke_id ON user_joke_interactions(joke_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_joke_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_joke_interactions(created_at DESC);

-- Create trending_jokes view for high-performing jokes
CREATE OR REPLACE VIEW trending_jokes AS
SELECT 
    j.*,
    -- Calculate trending score based on recent engagement
    (
        j.engagement_score * 0.4 +
        j.like_ratio * 0.3 +
        (j.total_views::decimal / GREATEST(EXTRACT(EPOCH FROM (NOW() - j.created_at))/3600, 1)) * 0.2 +
        (j.total_likes::decimal / GREATEST(j.total_views, 1)) * 0.1
    ) as trending_score
FROM jokes j
WHERE 
    j.is_approved = true 
    AND j.is_flagged = false
    AND j.total_views >= 10 -- Minimum views threshold
    AND j.created_at > NOW() - INTERVAL '7 days' -- Recent jokes only
ORDER BY trending_score DESC;

-- Create user preference analysis view
CREATE OR REPLACE VIEW user_humor_profiles AS
SELECT 
    ui.user_id,
    j.humor_style,
    COUNT(*) as total_interactions,
    COUNT(*) FILTER (WHERE ui.interaction_type = 'like') as likes,
    COUNT(*) FILTER (WHERE ui.interaction_type = 'dislike') as dislikes,
    COUNT(*) FILTER (WHERE ui.interaction_type = 'view') as views,
    (COUNT(*) FILTER (WHERE ui.interaction_type = 'like')::decimal / 
     GREATEST(COUNT(*) FILTER (WHERE ui.interaction_type IN ('like', 'dislike')), 1)) as preference_score
FROM user_joke_interactions ui
JOIN jokes j ON ui.joke_id = j.id
WHERE ui.created_at > NOW() - INTERVAL '30 days'
GROUP BY ui.user_id, j.humor_style;

-- Function to update joke performance metrics
CREATE OR REPLACE FUNCTION update_joke_metrics(joke_id_param BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE jokes 
    SET 
        total_views = (
            SELECT COUNT(*) 
            FROM user_joke_interactions 
            WHERE joke_id = joke_id_param AND interaction_type = 'view'
        ),
        total_likes = (
            SELECT COUNT(*) 
            FROM user_joke_interactions 
            WHERE joke_id = joke_id_param AND interaction_type = 'like'
        ),
        total_dislikes = (
            SELECT COUNT(*) 
            FROM user_joke_interactions 
            WHERE joke_id = joke_id_param AND interaction_type = 'dislike'
        )
    WHERE id = joke_id_param;
    
    -- Update calculated metrics
    UPDATE jokes 
    SET 
        like_ratio = CASE 
            WHEN (total_likes + total_dislikes) > 0 
            THEN total_likes::decimal / (total_likes + total_dislikes)
            ELSE 0.5 
        END,
        engagement_score = (
            (total_likes * 2.0 + total_views * 0.1 - total_dislikes * 1.0) / 
            GREATEST(total_views, 1)
        )
    WHERE id = joke_id_param;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update metrics when interactions change
CREATE OR REPLACE FUNCTION trigger_update_joke_metrics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_joke_metrics(NEW.joke_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_joke_metrics_trigger
    AFTER INSERT OR UPDATE ON user_joke_interactions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_joke_metrics();

-- Enable RLS on new tables
ALTER TABLE jokes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_joke_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jokes (read-only for users, admins can modify)
CREATE POLICY "Anyone can view approved jokes" ON jokes
    FOR SELECT USING (is_approved = true AND is_flagged = false);

-- RLS Policies for user interactions
CREATE POLICY "Users can view their own interactions" ON user_joke_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions" ON user_joke_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" ON user_joke_interactions
    FOR UPDATE USING (auth.uid() = user_id);
