-- Create a security definer function to check roles safely without triggering infinite recursion on the profiles table
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Create policy to allow Admins to update any profile (e.g. approve user, change department or role)
DROP POLICY IF EXISTS "Allow admins to update any profile" ON public.profiles;
CREATE POLICY "Allow admins to update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.get_my_role() = 'admin'::public.user_role)
WITH CHECK (public.get_my_role() = 'admin'::public.user_role);
