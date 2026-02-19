-- Allow super_admins to insert organizations
CREATE POLICY "Super admins can insert organizations"
ON public.organizations
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'
));