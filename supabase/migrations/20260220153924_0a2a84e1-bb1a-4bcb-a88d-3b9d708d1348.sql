
SELECT cron.schedule(
  'verificar-vencimento-plano',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://acyqrpkdsxddkqfaakty.supabase.co/functions/v1/verificar-vencimento-plano',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeXFycGtkc3hkZGtxZmFha3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MjE5MjAsImV4cCI6MjA4NTQ5NzkyMH0.hDEsVxfYQ5r1pr-GjQwmCHB3nyDe0mgXFvZ6JmPr3YE"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
