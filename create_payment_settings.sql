-- Create a table for global system settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- RLS Policies
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow authenticated read access" ON public.system_settings
    FOR SELECT TO authenticated USING (true);

-- Allow write access only to admins (assuming admin_users table exists or specific check)
-- For now, we'll allow authenticated users to update if they are admins. 
-- Adjust this policy based on your specific admin role implementation.
-- Here we check if the user is in the admin_users table.
CREATE POLICY "Allow admin insert/update" ON public.system_settings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE id = auth.uid()
        )
    );

-- Create a reusable function to get a setting
CREATE OR REPLACE FUNCTION get_system_setting(setting_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (SELECT value FROM public.system_settings WHERE key = setting_key);
END;
$$;
