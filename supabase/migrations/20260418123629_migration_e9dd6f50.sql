-- Create practice_sessions table to track user progress
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  category TEXT NOT NULL,
  group_name TEXT NOT NULL,
  question_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "practice_sessions_select_own" ON practice_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "practice_sessions_insert_own" ON practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_category ON practice_sessions(user_id, category);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_category_group ON practice_sessions(user_id, category, group_name);

-- Comment
COMMENT ON TABLE practice_sessions IS 'Tracks user practice session answers for progress tracking';