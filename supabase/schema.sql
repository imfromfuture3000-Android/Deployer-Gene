-- RALPH SUPABASE SCHEMA
BEGIN;
CREATE TABLE IF NOT EXISTS "users" (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),auth_uid uuid UNIQUE,display_name text,avatar_url text,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS "threads" (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),title text,created_by uuid NOT NULL,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS "thread_participants" (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),thread_id uuid NOT NULL REFERENCES "threads"(id) ON DELETE CASCADE,user_id uuid NOT NULL,role text DEFAULT 'member',joined_at timestamptz DEFAULT now(),UNIQUE(thread_id, user_id));
CREATE TABLE IF NOT EXISTS "messages" (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),thread_id uuid NOT NULL REFERENCES "threads"(id) ON DELETE CASCADE,user_id uuid NOT NULL,body text NOT NULL,metadata jsonb,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS "thread_summaries" (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),thread_id uuid NOT NULL REFERENCES "threads"(id) ON DELETE CASCADE,summary text NOT NULL,model text,tokens_used int,created_by uuid NOT NULL,created_at timestamptz DEFAULT now());
CREATE INDEX IF NOT EXISTS idx_messages_thread_created_at ON "messages"(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user ON "thread_participants"(user_id, thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_summaries_thread ON "thread_summaries"(thread_id);
ALTER TABLE IF EXISTS "threads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "thread_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "thread_summaries" ENABLE ROW LEVEL SECURITY;
COMMIT;
