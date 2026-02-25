
-- Fix editais RLS policies: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Authenticated users can read editais" ON public.editais;
DROP POLICY IF EXISTS "Super admins can manage editais" ON public.editais;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Authenticated users can read editais"
ON public.editais FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admins can manage editais"
ON public.editais FOR ALL
TO authenticated
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));
