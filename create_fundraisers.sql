-- Create types
CREATE TYPE fundraiser_status AS ENUM ('pending', 'approved', 'rejected', 'completed', 'paused');

-- Create fundraisers table
CREATE TABLE fundraisers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    condition TEXT NOT NULL,
    hospital TEXT,
    location TEXT,
    amount_needed NUMERIC NOT NULL,
    amount_raised NUMERIC DEFAULT 0,
    deadline TIMESTAMPTZ,
    status fundraiser_status DEFAULT 'pending',
    description TEXT,
    requester_id UUID REFERENCES auth.users(id),
    cover_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create fundraiser_documents table
CREATE TABLE fundraiser_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fundraiser_id UUID REFERENCES fundraisers(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    document_type TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE fundraisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundraiser_documents ENABLE ROW LEVEL SECURITY;

-- Policies for fundraisers
CREATE POLICY "Public can view approved fundraisers" ON fundraisers
    FOR SELECT USING (status = 'approved' OR status = 'completed');

CREATE POLICY "Requesters can CRUD their own fundraisers" ON fundraisers
    FOR ALL USING (auth.uid() = requester_id);

CREATE POLICY "Admins can manage all fundraisers" ON fundraisers
    FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Policies for documents
CREATE POLICY "Public can view documents of approved fundraisers" ON fundraiser_documents
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM fundraisers
        WHERE fundraisers.id = fundraiser_documents.fundraiser_id
        AND (fundraisers.status = 'approved' OR fundraisers.status = 'completed')
    ));

CREATE POLICY "Requesters can manage their documents" ON fundraiser_documents
    FOR ALL USING (EXISTS (
        SELECT 1 FROM fundraisers
        WHERE fundraisers.id = fundraiser_documents.fundraiser_id
        AND fundraisers.requester_id = auth.uid()
    ));

CREATE POLICY "Admins can manage all documents" ON fundraiser_documents
    FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Grant permissions needed
GRANT SELECT, INSERT, UPDATE, DELETE ON fundraisers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fundraiser_documents TO authenticated;
GRANT SELECT ON fundraisers TO anon; -- For viewing public ones
