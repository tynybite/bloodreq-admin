-- Notifications Log Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  segment TEXT DEFAULT 'All',
  blood_group TEXT,
  sent_by UUID REFERENCES auth.users(id),
  recipients INTEGER,
  onesignal_id TEXT,
  success BOOLEAN DEFAULT true,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

-- Policy: Admin users can view all notifications
CREATE POLICY "Admin users can view notifications"
  ON notifications_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy: Admin users can insert notifications
CREATE POLICY "Admin users can insert notifications"
  ON notifications_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_log_created_at ON notifications_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_log_sent_by ON notifications_log(sent_by);
