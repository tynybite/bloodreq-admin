-- Create a view to calculate blood type distribution
-- This avoids complex client-side counting or slow aggregate queries on large tables
-- We use a view so RLS on underlying tables (profiles) is respected BUT for views RLS is tricky.
-- Ideally we use security definer function, avoiding RLS on the view itself for aggregation.

CREATE OP REPLACE VIEW blood_type_distribution AS
SELECT 
    blood_group, 
    COUNT(*) as count,
    (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM profiles WHERE blood_group IS NOT NULL)) as percentage
FROM profiles 
WHERE blood_group IS NOT NULL
GROUP BY blood_group;

-- Grant access (if needed, though usually standard for authenticated users)
GRANT SELECT ON blood_type_distribution TO authenticated;
GRANT SELECT ON blood_type_distribution TO service_role;
