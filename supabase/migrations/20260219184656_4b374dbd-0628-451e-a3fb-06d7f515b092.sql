
-- Allow authenticated users to read non-secret system settings (like PIX config)
CREATE POLICY "Authenticated users can read public system settings"
  ON public.system_settings
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND (is_secret IS NULL OR is_secret = false));
