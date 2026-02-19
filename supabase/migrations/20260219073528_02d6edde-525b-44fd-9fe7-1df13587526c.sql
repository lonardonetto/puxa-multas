
-- Allow super_admins to read all user_organizations
CREATE POLICY "Super admins can read all memberships"
ON public.user_organizations
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'
));

-- Allow super_admins to manage all user_organizations
CREATE POLICY "Super admins can manage all memberships"
ON public.user_organizations
FOR ALL
USING (EXISTS (
  SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'
));
