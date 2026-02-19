-- Allow super_admins to delete users
CREATE POLICY "Super admins can delete users"
ON public.users
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'
));