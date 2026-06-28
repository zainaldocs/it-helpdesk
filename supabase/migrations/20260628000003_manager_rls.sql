-- 1. Policy to allow managers to view tickets from their department
DROP POLICY IF EXISTS "Managers can read tickets from their department" ON tickets;
CREATE POLICY "Managers can read tickets from their department"
ON tickets FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'manager'::public.user_role AND
  (SELECT department_id FROM public.profiles WHERE id = tickets.created_by) = (SELECT department_id FROM public.profiles WHERE id = auth.uid())
);

-- 2. Policy to allow managers to approve/cancel pending tickets from their department
DROP POLICY IF EXISTS "Managers can update pending tickets from their department" ON tickets;
CREATE POLICY "Managers can update pending tickets from their department"
ON tickets FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'manager'::public.user_role AND
  status = 'pending_approval'::public.ticket_status AND
  (SELECT department_id FROM public.profiles WHERE id = tickets.created_by) = (SELECT department_id FROM public.profiles WHERE id = auth.uid())
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'manager'::public.user_role AND
  status IN ('open'::public.ticket_status, 'cancelled'::public.ticket_status) AND
  (SELECT department_id FROM public.profiles WHERE id = tickets.created_by) = (SELECT department_id FROM public.profiles WHERE id = auth.uid())
);
