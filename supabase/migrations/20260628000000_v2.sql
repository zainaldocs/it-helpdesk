-- 1. UPDATE ENUMS (Note: ALTER TYPE ADD VALUE cannot be executed in transaction block in some environments, but is fine in Supabase migrations if run standalone or handle separately)
-- Add 'manager' role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager';
-- Add 'pending_approval' and 'cancelled' status
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'pending_approval' BEFORE 'open';
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Create account_status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
    CREATE TYPE account_status AS ENUM ('pending', 'active', 'suspended');
  END IF;
END$$;

-- 2. CREATE DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on Departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Check and create policies for departments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'departments' AND policyname = 'Anyone can read departments') THEN
    CREATE POLICY "Anyone can read departments" ON departments FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'departments' AND policyname = 'Admins can manage departments') THEN
    CREATE POLICY "Admins can manage departments" ON departments FOR ALL TO authenticated USING (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );
  END IF;
END$$;

-- 3. CREATE ASSETS TABLE
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on Assets
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Check and create policies for assets
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Users can view assets in their department') THEN
    CREATE POLICY "Users can view assets in their department" ON assets FOR SELECT TO authenticated USING (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR
      department_id = (SELECT department_id FROM profiles WHERE id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Admins can manage assets') THEN
    CREATE POLICY "Admins can manage assets" ON assets FOR ALL TO authenticated USING (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );
  END IF;
END$$;

-- 4. UPDATE PROFILES TABLE
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status account_status DEFAULT 'pending'::account_status NOT NULL;

-- Make existing users active so they are not locked out
UPDATE profiles SET account_status = 'active' WHERE account_status = 'pending';

-- 5. UPDATE TICKETS TABLE
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES assets(id) ON DELETE SET NULL;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- 6. UPDATE TRIGGER FUNCTION FOR NEW USER (Set default to pending)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, account_status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'end_user'::public.user_role),
    'pending'::public.account_status
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. FIX PROFILES RLS FOR ADMIN UPDATE
-- Create a security definer function to check roles safely without triggering infinite recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Create policy to allow Admins to update any profile
DROP POLICY IF EXISTS "Allow admins to update any profile" ON public.profiles;
CREATE POLICY "Allow admins to update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.get_my_role() = 'admin'::public.user_role)
WITH CHECK (public.get_my_role() = 'admin'::public.user_role);

