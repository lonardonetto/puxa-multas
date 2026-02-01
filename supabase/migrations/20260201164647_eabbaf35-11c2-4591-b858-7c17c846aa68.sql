-- Política para Super Admins poderem atualizar qualquer organização
CREATE POLICY "Super admins can update any organization" 
ON public.organizations 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.role = 'super_admin'
));

-- Política para Super Admins poderem inserir faturamento em qualquer organização
CREATE POLICY "Super admins can insert faturamento for any organization" 
ON public.faturamento 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.role = 'super_admin'
));

-- Política para Super Admins poderem atualizar faturamento de qualquer organização
CREATE POLICY "Super admins can update faturamento for any organization" 
ON public.faturamento 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = auth.uid() 
  AND users.role = 'super_admin'
));