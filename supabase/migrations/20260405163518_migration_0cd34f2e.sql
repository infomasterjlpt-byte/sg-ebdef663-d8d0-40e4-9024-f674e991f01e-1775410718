-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  target_level TEXT DEFAULT 'N5',
  is_premium BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  streak INTEGER DEFAULT 0,
  last_study_date DATE,
  daily_goal INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT NOT NULL,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  answer_index INTEGER NOT NULL,
  explanation TEXT,
  example_sentence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mode TEXT NOT NULL
);

-- Review items table
CREATE TABLE IF NOT EXISTS review_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'learning',
  correct_streak INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Mock tests table
CREATE TABLE IF NOT EXISTS mock_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,
  sections JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily progress table
CREATE TABLE IF NOT EXISTS daily_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  questions_answered INTEGER DEFAULT 0,
  goal_met BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_questions_level ON questions(level);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_question_id ON results(question_id);
CREATE INDEX IF NOT EXISTS idx_review_items_user_id ON review_items(user_id);
CREATE INDEX IF NOT EXISTS idx_review_items_status ON review_items(status);
CREATE INDEX IF NOT EXISTS idx_mock_tests_user_id ON mock_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON daily_progress(user_id, date);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for questions (public read)
CREATE POLICY "questions_public_read" ON questions FOR SELECT USING (true);

-- RLS Policies for results
CREATE POLICY "results_select_own" ON results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "results_insert_own" ON results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for review_items
CREATE POLICY "review_items_select_own" ON review_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "review_items_insert_own" ON review_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "review_items_update_own" ON review_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "review_items_delete_own" ON review_items FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for mock_tests
CREATE POLICY "mock_tests_select_own" ON mock_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mock_tests_insert_own" ON mock_tests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for daily_progress
CREATE POLICY "daily_progress_select_own" ON daily_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_progress_insert_own" ON daily_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_progress_update_own" ON daily_progress FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();