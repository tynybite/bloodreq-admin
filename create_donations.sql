-- Create donations table
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fundraiser_id UUID REFERENCES public.fundraisers(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('bkash', 'paypal', 'manual')),
    transaction_id TEXT,
    donor_name TEXT,
    donor_phone TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('completed', 'failed', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins can view all donations
CREATE POLICY "Admins can view all donations" ON public.donations
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );

-- Public/Users can insert donations (usually via API/App)
-- Allowing authenticated users (including donors) to insert
CREATE POLICY "Authenticated users can insert donations" ON public.donations
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Users can view their own donations (optional, if we track donor_id, but here strictly for admins/fundraiser context)
-- Depending on requirements, we might restrict this. For now, let's keep it simple for the admin panel functionality.

-- Trigger to update amount_raised in fundraisers table
CREATE OR REPLACE FUNCTION update_fundraiser_raised_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'completed') OR
       (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed') THEN
        UPDATE public.fundraisers
        SET amount_raised = amount_raised + NEW.amount
        WHERE id = NEW.fundraiser_id;
    ELSIF (TG_OP = 'DELETE' AND OLD.status = 'completed') OR
          (TG_OP = 'UPDATE' AND NEW.status != 'completed' AND OLD.status = 'completed') THEN
        UPDATE public.fundraisers
        SET amount_raised = amount_raised - OLD.amount
        WHERE id = OLD.fundraiser_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_raised_amount_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION update_fundraiser_raised_amount();
