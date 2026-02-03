-- Remover job semanal existente
SELECT cron.unschedule(1);

-- Criar job diário (todos os dias às 08:00)
SELECT cron.schedule(
  'rastreamento-diario',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url:='https://acyqrpkdsxddkqfaakty.supabase.co/functions/v1/rastreamento-semanal',
    headers:='{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeXFycGtkc3hkZGtxZmFha3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjE5MjAsImV4cCI6MjA4NTQ5NzkyMH0.hDEsVxfYQ5r1pr-GjQwmCHB3nyDe0mgXFvZ6JmPr3YE"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);