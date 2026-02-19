-- Fix: Update saldo for Atualiza Brasil org that had credits added but balance not updated
UPDATE public.organizations 
SET saldo_sacavel = 100 
WHERE id = '8d5c8336-f5dc-4803-8e9f-c6ac6f3c09d0' 
AND saldo_sacavel = 0;