-- MIGRATE AUTH USERS (V3 - Fix generated email column)
-- Project: acyqrpkdsxddkqfaakty (Receiver)

-- 1. dra.cintiaborges@gmail.com
INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES (
    'e8e11f7e-2296-405e-b71b-8aff23b94ea7',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'dra.cintiaborges@gmail.com',
    '$2a$10$WMHo17CoQAAf5eSzUA8MeOZHuxyvrGOhGSPTvhvskink5aPJrr35u',
    '2026-01-07 17:44:36.313187+00',
    '2026-01-07 17:44:36.262392+00',
    '2026-02-01 10:56:11.642236+00',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"e8e11f7e-2296-405e-b71b-8aff23b94ea7","nome":"LEONARDO PEREIRA","role":"super_admin","email":"dra.cintiaborges@gmail.com","telefone":"21970402529","avatar_url":"https://ujgnfwdeifiqvvvbeyjk.supabase.co/storage/v1/object/public/avatars/e8e11f7e-2296-405e-b71b-8aff23b94ea7/1767908442854.jpg","email_verified":true,"phone_verified":false,"organization_name":"ZAPMATIC TECH"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

-- 2. leonardonettoads@gmail.com
INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES (
    'f6611696-dbf0-48c8-86db-e148db7316c3',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'leonardonettoads@gmail.com',
    '$2a$10$.tpAX6JrTcYuYe1ehajDxOPicOYjDarFdR19Rhu5Ru03XIbSKSSXK',
    '2026-01-07 19:15:17.175991+00',
    '2026-01-07 19:15:17.098471+00',
    '2026-01-09 08:49:27.122205+00',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"f6611696-dbf0-48c8-86db-e148db7316c3","nome":"DENNY MENDES","role":"super_admin","email":"leonardonettoads@gmail.com","telefone":"","avatar_url":"https://ujgnfwdeifiqvvvbeyjk.supabase.co/storage/v1/object/public/avatars/f6611696-dbf0-48c8-86db-e148db7316c3/1767819212000.png","email_verified":true,"phone_verified":false,"organization_id":"2cbd0fea-3023-490a-b616-b0355fa48185"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

-- 3. Link Identities (Fix: Include provider_id, remove email)
INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    gen_random_uuid(), 
    'e8e11f7e-2296-405e-b71b-8aff23b94ea7', 
    '{"sub":"e8e11f7e-2296-405e-b71b-8aff23b94ea7", "email": "dra.cintiaborges@gmail.com"}'::jsonb, 
    'email', 
    'e8e11f7e-2296-405e-b71b-8aff23b94ea7', 
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    gen_random_uuid(), 
    'f6611696-dbf0-48c8-86db-e148db7316c3', 
    '{"sub":"f6611696-dbf0-48c8-86db-e148db7316c3", "email": "leonardonettoads@gmail.com"}'::jsonb, 
    'email', 
    'f6611696-dbf0-48c8-86db-e148db7316c3', 
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;
