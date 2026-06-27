-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'technician', 'end_user');
CREATE TYPE ticket_urgency AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- 2. PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'end_user'::user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow users to update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. TICKETS TABLE
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  urgency ticket_urgency DEFAULT 'low'::ticket_urgency NOT NULL,
  status ticket_status DEFAULT 'open'::ticket_status NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on Tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Tickets policies
CREATE POLICY "End-users can read their own tickets"
ON tickets FOR SELECT
TO authenticated
USING (
  created_by = auth.uid() OR 
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'technician')
);

CREATE POLICY "End-users can create tickets"
ON tickets FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
);

CREATE POLICY "Technicians and Admins can update tickets"
ON tickets FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'technician') OR
  (created_by = auth.uid() AND status = 'open')
)
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'technician') OR
  (created_by = auth.uid() AND status = 'open')
);

-- 4. TICKET NOTES TABLE
CREATE TABLE ticket_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on Ticket Notes
ALTER TABLE ticket_notes ENABLE ROW LEVEL SECURITY;

-- Ticket Notes policies
CREATE POLICY "Users can view notes for their tickets (non-internal only)"
ON ticket_notes FOR SELECT
TO authenticated
USING (
  (
    (SELECT created_by FROM tickets WHERE id = ticket_id) = auth.uid() 
    AND is_internal = false
  ) OR 
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'technician')
);

CREATE POLICY "Users can create notes for their tickets"
ON ticket_notes FOR INSERT
TO authenticated
WITH CHECK (
  (
    (SELECT created_by FROM tickets WHERE id = ticket_id) = auth.uid() 
    AND is_internal = false 
    AND user_id = auth.uid()
  ) OR 
  (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'technician') 
    AND user_id = auth.uid()
  )
);

-- 5. TRIGGER FOR AUTOMATIC PROFILE CREATION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'end_user'::public.user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. FUNCTION & TRIGGER: Auto-Generate Ticket Number (TCK-YYYYMM-XXXX)
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT := 'TCK-' || to_char(NOW(), 'YYYYMM') || '-';
    seq_val INT;
BEGIN
    -- Mengambil angka urut tertinggi pada bulan berjalan untuk menghindari duplikasi saat ada tiket yang dihapus
    SELECT COALESCE(MAX(SUBSTRING(ticket_number FROM 12 FOR 4)::INT), 0) + 1 
    INTO seq_val 
    FROM tickets 
    WHERE ticket_number LIKE prefix || '%';
    
    NEW.ticket_number := prefix || LPAD(seq_val::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_generate_ticket_number
BEFORE INSERT ON tickets
FOR EACH ROW
EXECUTE FUNCTION generate_ticket_number();
