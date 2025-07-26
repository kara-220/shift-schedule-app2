-- シフト希望表のテーブル作成
CREATE TABLE IF NOT EXISTS shift_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  shifts JSONB NOT NULL,
  time_requests JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_shift_requests_email ON shift_requests(email);
CREATE INDEX IF NOT EXISTS idx_shift_requests_period ON shift_requests(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_shift_requests_submitted_at ON shift_requests(submitted_at);

-- 管理者テーブル（簡単な認証用）
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- サンプル管理者データ（パスワード: admin123）
INSERT INTO admins (email, password_hash) 
VALUES ('admin@example.com', '$2b$10$example_hash_here')
ON CONFLICT (email) DO NOTHING;
