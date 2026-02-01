SET statement_timeout = 0;
SET client_encoding = 'UTF8';

INSERT INTO public."organizations" ("id", "nome", "cnpj", "email", "telefone", "plano", "ativo", "limite_usuarios", "limite_clientes", "data_expiracao", "created_at", "updated_at", "cpf", "saldo_sacavel", "saldo_bonus", "acesso_crm", "acesso_disparador", "logo_url", "cor_primaria", "cabecalho_texto", "rodape_texto", "endereco_completo", "site_url", "cor_secundaria", "estilo_cabecalho", "logo_contrato_url", "timbre_contrato_url", "nome_contrato", "cnpj_contrato", "endereco_contrato", "intervalo_notificacao") VALUES ('2cbd0fea-3023-490a-b616-b0355fa48185', 'EMPRESA 001', NULL, 'dra.cintiaborges@gmail.com', '21970402529', 'gratuito', TRUE, 1, 100, NULL, '2026-01-07T19:06:00.547003+00:00', '2026-01-09T08:49:17.93131+00:00', '09234041712', 1370.0, 50, TRUE, TRUE, NULL, '#10B981', NULL, NULL, NULL, NULL, '#333333', 'elegant', NULL, NULL, NULL, NULL, NULL, 7) ON CONFLICT DO NOTHING;
INSERT INTO public."organizations" ("id", "nome", "cnpj", "email", "telefone", "plano", "ativo", "limite_usuarios", "limite_clientes", "data_expiracao", "created_at", "updated_at", "cpf", "saldo_sacavel", "saldo_bonus", "acesso_crm", "acesso_disparador", "logo_url", "cor_primaria", "cabecalho_texto", "rodape_texto", "endereco_completo", "site_url", "cor_secundaria", "estilo_cabecalho", "logo_contrato_url", "timbre_contrato_url", "nome_contrato", "cnpj_contrato", "endereco_contrato", "intervalo_notificacao") VALUES ('379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'ZAPMATIC TECH', NULL, NULL, NULL, 'top', TRUE, 20, 100, NULL, '2026-01-07T17:44:36.262062+00:00', '2026-01-09T19:09:46.440182+00:00', NULL, 10000.0, 704.4, FALSE, FALSE, NULL, '#1aff88', NULL, NULL, NULL, NULL, '#333333', 'elegant', 'https://ujgnfwdeifiqvvvbeyjk.supabase.co/storage/v1/object/public/avatars/379823ca-c287-4f1b-83cb-ed76a31b7d5e/logo_1767908260232.jpg', 'https://ujgnfwdeifiqvvvbeyjk.supabase.co/storage/v1/object/public/avatars/379823ca-c287-4f1b-83cb-ed76a31b7d5e/timbre_1767908266647.jpg', 'ZAPMATIC ON', '00E00R9999E9E9E9E9E', 'RUA TESTE, 5887, UURITUUTIIR', 7) ON CONFLICT DO NOTHING;
INSERT INTO public."users" ("id", "email", "nome", "telefone", "created_at", "updated_at", "role", "avatar_url") VALUES ('f6611696-dbf0-48c8-86db-e148db7316c3', 'leonardonettoads@gmail.com', 'DENNY MENDES', '', '2026-01-07T19:15:17.096337+00:00', '2026-01-08T15:45:46.829906+00:00', 'admin', 'https://ujgnfwdeifiqvvvbeyjk.supabase.co/storage/v1/object/public/avatars/f6611696-dbf0-48c8-86db-e148db7316c3/1767819212000.png') ON CONFLICT DO NOTHING;
INSERT INTO public."users" ("id", "email", "nome", "telefone", "created_at", "updated_at", "role", "avatar_url") VALUES ('e8e11f7e-2296-405e-b71b-8aff23b94ea7', 'dra.cintiaborges@gmail.com', 'LEONARDO PEREIRA', '21970402529', '2026-01-07T17:44:36.262062+00:00', '2026-01-08T21:40:43.373315+00:00', 'super_admin', 'https://ujgnfwdeifiqvvvbeyjk.supabase.co/storage/v1/object/public/avatars/e8e11f7e-2296-405e-b71b-8aff23b94ea7/1767908442854.jpg') ON CONFLICT DO NOTHING;
INSERT INTO public."user_organizations" ("id", "user_id", "organization_id", "role", "created_at") VALUES ('5043c6a2-2786-4398-8ae6-a73c85fd03a8', 'e8e11f7e-2296-405e-b71b-8aff23b94ea7', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'user', '2026-01-07T17:44:36.262062+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."user_organizations" ("id", "user_id", "organization_id", "role", "created_at") VALUES ('bd2d63b8-b54f-434c-b3da-e82feb836340', 'f6611696-dbf0-48c8-86db-e148db7316c3', '2cbd0fea-3023-490a-b616-b0355fa48185', 'admin', '2026-01-07T19:15:17.096337+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."planos" ("id", "nome", "slug", "descricao", "preco_mensal", "limite_usuarios", "limite_clientes", "recursos", "ativo", "created_at", "updated_at", "preco_recurso_ia", "preco_rastreamento", "preco_edital", "recursos_ia_inclusos", "acesso_crm", "acesso_disparador", "modulo_educacional", "recursos_ia_suspensao_inclusos", "recursos_ia_suspensao_preco_adicional", "marketing_digital", "suporte", "acesso_institucional", "rastreamento_pf_preco", "rastreamento_frota_preco", "rastreamento_garantido_preco") VALUES ('955b013c-ac6d-4476-90c7-b95478d6b90e', 'Gratuito', 'gratuito', 'Plano gratuito para começar. Ideal para quem quer testar o sistema.', 0.0, 1, 50, '["Cadastro de at\u00e9 100 clientes", "Gera\u00e7\u00e3o de Recursos (R$ 150/un)", "Rastreamento de Multas (R$ 50/un)", "Editais (R$ 1,50/contato)"]'::jsonb, TRUE, '2026-01-08T14:00:01.823592+00:00', '2026-01-09T18:36:31.338886+00:00', 150.0, 50.0, 1.5, 0, FALSE, FALSE, 'Nenhum', 0, 300, NULL, 'Padrão', FALSE, 50, 45, 65) ON CONFLICT DO NOTHING;
INSERT INTO public."planos" ("id", "nome", "slug", "descricao", "preco_mensal", "limite_usuarios", "limite_clientes", "recursos", "ativo", "created_at", "updated_at", "preco_recurso_ia", "preco_rastreamento", "preco_edital", "recursos_ia_inclusos", "acesso_crm", "acesso_disparador", "modulo_educacional", "recursos_ia_suspensao_inclusos", "recursos_ia_suspensao_preco_adicional", "marketing_digital", "suporte", "acesso_institucional", "rastreamento_pf_preco", "rastreamento_frota_preco", "rastreamento_garantido_preco") VALUES ('bbe33943-01df-41f9-a9f8-a9c57871bbd9', 'Top', 'top', 'A solução completa para escritórios de advocacia. Inclui CRM + Disparador.', 999.0, 3, NULL, '["Clientes ilimitados", "30 Recursos IA gr\u00e1tis/m\u00eas (excedente R$ 20)", "Rastreamento de Multas (R$ 25/un)", "Editais (R$ 0,80/contato)", "Acesso ao CRM + IA", "Acesso ao Disparador"]'::jsonb, TRUE, '2026-01-08T14:00:01.823592+00:00', '2026-01-09T20:15:45.828551+00:00', 40.0, 25.0, 0.8, 0, TRUE, TRUE, 'Completo', 0, 40, NULL, 'VIP', TRUE, 25, 20, 40) ON CONFLICT DO NOTHING;
INSERT INTO public."planos" ("id", "nome", "slug", "descricao", "preco_mensal", "limite_usuarios", "limite_clientes", "recursos", "ativo", "created_at", "updated_at", "preco_recurso_ia", "preco_rastreamento", "preco_edital", "recursos_ia_inclusos", "acesso_crm", "acesso_disparador", "modulo_educacional", "recursos_ia_suspensao_inclusos", "recursos_ia_suspensao_preco_adicional", "marketing_digital", "suporte", "acesso_institucional", "rastreamento_pf_preco", "rastreamento_frota_preco", "rastreamento_garantido_preco") VALUES ('01a09d9c-4c51-45c7-86ec-9f3d6750f7e3', 'Free', 'free', 'Plano gratuito para entusiastas', 0.0, 1, 5, '["B\u00e1sico", "IA Limitada"]'::jsonb, FALSE, '2026-01-07T19:57:43.510924+00:00', '2026-01-08T14:00:01.823592+00:00', 150.0, 50.0, 1.5, 0, FALSE, FALSE, 'Nenhum', 0, 0, NULL, 'Padrão', FALSE, 0, 0, 0) ON CONFLICT DO NOTHING;
INSERT INTO public."planos" ("id", "nome", "slug", "descricao", "preco_mensal", "limite_usuarios", "limite_clientes", "recursos", "ativo", "created_at", "updated_at", "preco_recurso_ia", "preco_rastreamento", "preco_edital", "recursos_ia_inclusos", "acesso_crm", "acesso_disparador", "modulo_educacional", "recursos_ia_suspensao_inclusos", "recursos_ia_suspensao_preco_adicional", "marketing_digital", "suporte", "acesso_institucional", "rastreamento_pf_preco", "rastreamento_frota_preco", "rastreamento_garantido_preco") VALUES ('122046c8-1b93-410d-b2f7-aac3206a2cef', 'Basic', 'basic', 'Para pequenos negócios', 49.9, 5, 50, '["Intermedi\u00e1rio", "IA Standard"]'::jsonb, FALSE, '2026-01-07T19:57:43.510924+00:00', '2026-01-08T14:00:01.823592+00:00', 150.0, 50.0, 1.5, 0, FALSE, FALSE, 'Nenhum', 0, 0, NULL, 'Padrão', FALSE, 0, 0, 0) ON CONFLICT DO NOTHING;
INSERT INTO public."planos" ("id", "nome", "slug", "descricao", "preco_mensal", "limite_usuarios", "limite_clientes", "recursos", "ativo", "created_at", "updated_at", "preco_recurso_ia", "preco_rastreamento", "preco_edital", "recursos_ia_inclusos", "acesso_crm", "acesso_disparador", "modulo_educacional", "recursos_ia_suspensao_inclusos", "recursos_ia_suspensao_preco_adicional", "marketing_digital", "suporte", "acesso_institucional", "rastreamento_pf_preco", "rastreamento_frota_preco", "rastreamento_garantido_preco") VALUES ('9b1f138e-2d98-4e7e-8fd4-0363a7557fca', 'Premium', 'premium', 'A solução completa', 99.9, 20, 500, '["Avan\u00e7ado", "IA Ilimitada", "Suporte VIP"]'::jsonb, FALSE, '2026-01-07T19:57:43.510924+00:00', '2026-01-08T14:00:01.823592+00:00', 150.0, 50.0, 1.5, 0, FALSE, FALSE, 'Nenhum', 0, 0, NULL, 'Padrão', FALSE, 0, 0, 0) ON CONFLICT DO NOTHING;
INSERT INTO public."planos" ("id", "nome", "slug", "descricao", "preco_mensal", "limite_usuarios", "limite_clientes", "recursos", "ativo", "created_at", "updated_at", "preco_recurso_ia", "preco_rastreamento", "preco_edital", "recursos_ia_inclusos", "acesso_crm", "acesso_disparador", "modulo_educacional", "recursos_ia_suspensao_inclusos", "recursos_ia_suspensao_preco_adicional", "marketing_digital", "suporte", "acesso_institucional", "rastreamento_pf_preco", "rastreamento_frota_preco", "rastreamento_garantido_preco") VALUES ('c618503f-bb82-4413-b2ab-ccb43399d956', 'Intermediário', 'intermediario', 'Para profissionais que querem crescer. Até 100 clientes e preços reduzidos.', 399.0, 2, 100, '["Clientes ilimitados", "Gera\u00e7\u00e3o de Recursos (R$ 50/un)", "Rastreamento de Multas (R$ 40/un)", "Editais (R$ 1,20/contato)"]'::jsonb, TRUE, '2026-01-08T14:00:01.823592+00:00', '2026-01-09T20:17:01.562678+00:00', 50.0, 40.0, 1.2, 0, FALSE, FALSE, 'Parcial', 0, 100, NULL, 'Prioritário', FALSE, 40, 35, 55) ON CONFLICT DO NOTHING;
INSERT INTO public."planos" ("id", "nome", "slug", "descricao", "preco_mensal", "limite_usuarios", "limite_clientes", "recursos", "ativo", "created_at", "updated_at", "preco_recurso_ia", "preco_rastreamento", "preco_edital", "recursos_ia_inclusos", "acesso_crm", "acesso_disparador", "modulo_educacional", "recursos_ia_suspensao_inclusos", "recursos_ia_suspensao_preco_adicional", "marketing_digital", "suporte", "acesso_institucional", "rastreamento_pf_preco", "rastreamento_frota_preco", "rastreamento_garantido_preco") VALUES ('7a9a3611-51b3-4836-9a28-49e71d10283a', 'Enterprise', 'enterprise', 'Customizado para você', 0.0, 999, 9999, '["Tudo Liberado", "API Pr\u00f3pria"]'::jsonb, FALSE, '2026-01-07T19:57:43.510924+00:00', '2026-01-08T17:36:06.72552+00:00', 150.0, 50.0, 1.5, 0, TRUE, TRUE, 'Nenhum', 0, 0, NULL, 'Padrão', FALSE, 0, 0, 0) ON CONFLICT DO NOTHING;
INSERT INTO public."servicos" ("id", "organization_id", "nome", "descricao", "preco_base", "ativo", "created_at", "updated_at", "contrato_modelo", "campos_dinamicos", "ordem") VALUES ('55aedc8c-0254-4aa6-87ac-c97e1afca6d5', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'Recurso de Multa - Defesa Prévia', 'Assessoria completa para elaboração e protocolo de defesa prévia.', 150.0, TRUE, '2026-01-08T18:32:06.573344+00:00', '2026-01-08T18:32:06.573344+00:00', NULL, '[]'::jsonb, 0) ON CONFLICT DO NOTHING;
INSERT INTO public."servicos" ("id", "organization_id", "nome", "descricao", "preco_base", "ativo", "created_at", "updated_at", "contrato_modelo", "campos_dinamicos", "ordem") VALUES ('48bd11e3-9c8e-490d-b734-c93ae45422d3', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'Acompanhamento Mensal de Multas', 'Rastreamento ativo de novas multas para todos os veículos do cliente.', 49.9, TRUE, '2026-01-08T18:32:06.573344+00:00', '2026-01-08T22:06:39.623+00:00', NULL, '[]'::jsonb, 0) ON CONFLICT DO NOTHING;
INSERT INTO public."servicos" ("id", "organization_id", "nome", "descricao", "preco_base", "ativo", "created_at", "updated_at", "contrato_modelo", "campos_dinamicos", "ordem") VALUES ('5f15f2bc-8327-47a7-9114-fb7b976963cf', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'AIT + Suspensão (Multa + Suspensão)', 'Auto de Infração discutindo MULTA e SUSPENSÃO do direito de dirigir', 300.0, TRUE, '2026-01-08T22:14:51.623247+00:00', '2026-01-08T22:14:51.623247+00:00', 'CONTRATO DE PRESTAÇÃO DE SERVIÇO

CONTRATANTE:
NOME: {{NOME_CLIENTE}}
CPF: {{CPF_CLIENTE}}
RG: {{RG_CLIENTE}}
ENDEREÇO: {{ENDERECO_CLIENTE}}
TELEFONE: {{TELEFONE_CLIENTE}}
E-MAIL: {{EMAIL_CLIENTE}}

CONTRATADO: {{NOME_ORGANIZACAO}}, pessoa jurídica de direito privado, devidamente inscrito no CNPJ: {{CNPJ_ORGANIZACAO}}, com escritório profissional em {{ENDERECO_ORGANIZACAO}}.

CLÁUSULA PRIMEIRA – DAS OBRIGAÇÕES DO CONTRATADO:
A parte Contratada obriga-se a prestar seus serviços profissionais:

Nº do Auto de Infração: {{AUTO_INFRACAO}}
Nesses autos serão discutidas as penalidades: MULTA + SUSPENSÃO.

CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO(A) CONTRATANTE:
Em remuneração dos serviços descritos na cláusula anterior, o CONTRATANTE pagará a título de valores convencionais ao CONTRATADO, o valor:

    1. VALOR: {{VALOR_SERVICO}}
    2. FORMA DE PAGAMENTO: À vista ou conforme negociação.

§ 1° - O atraso no pagamento por mais de 10 dias sujeitará ao Contratante a multa de 10% (dez por cento) sobre o valor a ser pago, mais a incidência de juros moratórios de 1% ao mês.
§ 2° - O critério de correção monetária será o resultante do IGPM/FGV.
§ 3° - Custas e 20% de honorários advocatícios, caso o contrato precise ser executado judicialmente.
§ 4° - O contrato poderá ser rescindido por falta de pagamento, mediante notificação extrajudicial com prazo de 10 dias para regularização.

CLÁUSULA TERCEIRA – DA VIGÊNCIA E DEMAIS OBRIGAÇÕES:
O termo inicial do presente contrato é o de sua assinatura, e terminará ao fim do processo.

    1. Todos os recursos serão revisados para protocolo nos departamentos SEPEN-JARI-CETRAN.
    2. Caso o auto esteja em fase do SEPEN, iremos apresentar procuração e formular argumentos.
    3. Não há prazo estabelecido para julgamento dos recursos.
    4. A rescisão do contrato após o protocolo não exonera do pagamento.
    5. A venda do veículo durante o processo é de responsabilidade do Contratante.

CLÁUSULA QUARTA – DO FORO:
As partes contratantes elegem o Foro da Comarca de Campo Grande - MS.

Data: {{DATA_EXTENSO}}

_____________________________          _____________________________
     {{NOME_CLIENTE}}                    {{NOME_ORGANIZACAO}}
        CONTRATANTE                           CONTRATADA', '[]'::jsonb, 2) ON CONFLICT DO NOTHING;
INSERT INTO public."servicos" ("id", "organization_id", "nome", "descricao", "preco_base", "ativo", "created_at", "updated_at", "contrato_modelo", "campos_dinamicos", "ordem") VALUES ('0f690c0b-db3e-4b8d-924f-a3c7e1688f8d', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'Procuração', 'Documento para representação em órgãos de trânsito', 0.0, TRUE, '2026-01-08T22:15:29.352352+00:00', '2026-01-08T22:15:29.352352+00:00', 'PROCURAÇÃO

OUTORGANTE: {{NOME_CLIENTE}}, brasileiro(a), inscrito no CPF sob o nº {{CPF_CLIENTE}}, portador(a) da carteira de identidade nº {{RG_CLIENTE}}, residente e domiciliado(a) no endereço {{ENDERECO_CLIENTE}}.

OUTORGADO: {{NOME_ORGANIZACAO}}, inscrita no CNPJ sob o nº {{CNPJ_ORGANIZACAO}}, com escritório localizado em {{ENDERECO_ORGANIZACAO}}.

PODERES: para representar o(a) outorgante perante todos os órgãos de trânsito ou entidades, sejam estaduais, municipais e autarquias, também perante todos os órgãos do Poder Judiciário, em todos assuntos de seu interesse, utilizando os poderes da cláusula "ad judicia" e os especiais dos art. 359 e 105 do CPC, podendo transigir, acordar, discordar, concordar, desistir, renunciar, firmar compromissos, assinar, ter vista de processos, receber notificações, formular requerimentos, apresentar defesas e impugnações administrativas e/ou judicialmente, apresentar recursos, solicitar retirada de impedimentos, bloqueios e restrições, como também substabelecer esta, no todo ou em parte.

FINALIDADE: REPRESENTAÇÃO PERANTE TODOS OS ÓRGÃOS E AUTARQUIAS DE TRÂNSITO.

{{DATA_EXTENSO}}


_____________________________
{{NOME_CLIENTE}}', '[]'::jsonb, 3) ON CONFLICT DO NOTHING;
INSERT INTO public."clientes" ("id", "user_id", "tipo_pessoa", "nome_completo", "razao_social", "nome_fantasia", "cpf", "cnpj", "rg", "inscricao_estadual", "data_nascimento", "estado_civil", "profissao", "email", "telefone", "celular", "endereco", "created_at", "updated_at", "organization_id", "ativo", "crm_status", "crm_valor", "crm_origem", "crm_tipo", "crm_infracao", "descricao") VALUES ('222fc38c-0702-477e-8f91-5d083ad19007', 'e8e11f7e-2296-405e-b71b-8aff23b94ea7', 'fisica', 'LEONARDO NETTO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'dra.cintiaborges@gmail.com', NULL, '21970402529', NULL, '2026-01-09T12:58:06.920133+00:00', '2026-01-09T20:01:57.3178+00:00', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', TRUE, 'negociacao', 250.0, 'Google', 'NOVO TIPO', '', 'TESTE DE DESCRIÇÃO') ON CONFLICT DO NOTHING;
INSERT INTO public."clientes" ("id", "user_id", "tipo_pessoa", "nome_completo", "razao_social", "nome_fantasia", "cpf", "cnpj", "rg", "inscricao_estadual", "data_nascimento", "estado_civil", "profissao", "email", "telefone", "celular", "endereco", "created_at", "updated_at", "organization_id", "ativo", "crm_status", "crm_valor", "crm_origem", "crm_tipo", "crm_infracao", "descricao") VALUES ('25a8461f-7684-431a-a744-fb6a32674152', 'e8e11f7e-2296-405e-b71b-8aff23b94ea7', 'fisica', 'LEONARDO NETTO PEREIRA', NULL, NULL, '05313070770', NULL, '118543107', NULL, '1982-07-09', 'casado', 'DESENVOLVEDOR', 'dra.cintiaborges@gmail.com', '21970402529', '21970402529', '{"cep": "21321060", "bairro": "campinho", "cidade": "Belo Horizonte", "estado": "MG", "numero": "1666", "logradouro": "Rua Frederico Corn\u00e9lio", "complemento": ""}'::jsonb, '2026-01-08T18:22:06.141089+00:00', '2026-01-09T20:01:58.670546+00:00', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', FALSE, 'followup', 300.0, 'Indicação', 'Suspensão', '', 'AQUI TEM UM DESCIÇÃO TBM') ON CONFLICT DO NOTHING;
INSERT INTO public."clientes" ("id", "user_id", "tipo_pessoa", "nome_completo", "razao_social", "nome_fantasia", "cpf", "cnpj", "rg", "inscricao_estadual", "data_nascimento", "estado_civil", "profissao", "email", "telefone", "celular", "endereco", "created_at", "updated_at", "organization_id", "ativo", "crm_status", "crm_valor", "crm_origem", "crm_tipo", "crm_infracao", "descricao") VALUES ('e2941bb5-52a4-4714-8fb8-bbb17f2551fc', 'e8e11f7e-2296-405e-b71b-8aff23b94ea7', 'fisica', 'José da Silva', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'josesilva@1234.com.br', NULL, '11999998854', NULL, '2026-01-09T20:01:20.895358+00:00', '2026-01-16T15:49:35.481048+00:00', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', TRUE, 'fechado', 1200.0, 'Edital', 'Recurso', '', '') ON CONFLICT DO NOTHING;
INSERT INTO public."clientes" ("id", "user_id", "tipo_pessoa", "nome_completo", "razao_social", "nome_fantasia", "cpf", "cnpj", "rg", "inscricao_estadual", "data_nascimento", "estado_civil", "profissao", "email", "telefone", "celular", "endereco", "created_at", "updated_at", "organization_id", "ativo", "crm_status", "crm_valor", "crm_origem", "crm_tipo", "crm_infracao", "descricao") VALUES ('83cfdd36-83b5-4c67-bddb-47b4d2ce64d5', 'e8e11f7e-2296-405e-b71b-8aff23b94ea7', 'fisica', 'PAULO HENRIQUE', NULL, NULL, '33333333333', NULL, '3333333333', NULL, '3333-03-31', 'casado', '3333333', 'P@GMAIL.COM', '33333333333333', '11999999999', '{"cep": "33333333", "bairro": "333333", "cidade": "3333", "estado": "PA", "numero": "333", "logradouro": "33333333333333", "complemento": "33"}'::jsonb, '2026-01-16T15:52:23.061491+00:00', '2026-01-16T15:52:23.061491+00:00', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', TRUE, 'novo', 0.0, NULL, NULL, NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."veiculos" ("id", "cliente_id", "placa", "modelo", "ano", "renavam", "ativo", "created_at", "updated_at", "rastreamento_ativo", "rastreamento_inicio", "rastreamento_valor") VALUES ('a8c8d5e9-ca19-45de-8168-5c4513b81b42', '25a8461f-7684-431a-a744-fb6a32674152', 'kqt4616', 'new fiesta', '2025', '0108859948555', TRUE, '2026-01-08T18:22:06.317234+00:00', '2026-01-08T18:22:06.317234+00:00', FALSE, NULL, 15.0) ON CONFLICT DO NOTHING;
INSERT INTO public."veiculos" ("id", "cliente_id", "placa", "modelo", "ano", "renavam", "ativo", "created_at", "updated_at", "rastreamento_ativo", "rastreamento_inicio", "rastreamento_valor") VALUES ('c1bf6947-e29c-40f2-bef6-80daffda14b6', '83cfdd36-83b5-4c67-bddb-47b4d2ce64d5', 'abc1222', 'fiat linea', '2018', NULL, TRUE, '2026-01-16T15:52:23.156416+00:00', '2026-01-16T15:52:23.156416+00:00', FALSE, NULL, 15.0) ON CONFLICT DO NOTHING;
INSERT INTO public."contratos" ("id", "cliente_id", "servico_id", "status", "conteudo", "assinatura_data", "created_at", "updated_at", "organization_id", "valor", "auto_infracao", "penalidades", "forma_pagamento", "modelo_slug", "processo_administrativo", "fase_ait", "fase_processo", "testemunhas", "data_ultima_notificacao", "data_protocolo", "intervalo_notificacao", "last_checkin_notified_at", "lembrete_ativado", "data_proximo_lembrete", "alerta_ativo", "lido") VALUES ('ea35a9a9-58fb-41a9-866f-d03a01b35f3c', '25a8461f-7684-431a-a744-fb6a32674152', '48bd11e3-9c8e-490d-b734-c93ae45422d3', 'aguardando_julgamento', 'CONTRATO DE PRESTAÇÃO DE SERVIÇO:

CONTRATANTE:
NOME: LEONARDO NETTO PEREIRA
ESTADO CIVIL: casado
PROFISSÃO: DESENVOLVEDOR
NACIONALIDADE: Brasileira
CPF: 05313070770
RG: 118543107
ENDEREÇO: Rua Frederico Cornélio, 1666 – campinho – Belo Horizonte/MG – CEP: 21321060
TELEFONE: 21970402529
E-MAIL: dra.cintiaborges@gmail.com

CONTRATADO: ZAPMATIC TECH, pessoa jurídica de direito privado, devidamente inscrito no CNPJ: Não cadastrado, representado neste ato por seu sócio proprietário, com escritório profissional a Endereço da empresa.

CLÁUSULA PRIMEIRA – DAS OBRIGAÇÕES DO CONTRATADO: 
A parte Contratada obriga-se, a prestar seus serviços profissionais: 

Nº do Auto de Infração: Nº AUTO: ___________
Nesses autos serão discutidas as penalidades: MULTA + SUSPENSÃO.

CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO(A) CONTRATANTE: 
Em remuneração dos serviços descritos na cláusula anterior, o CONTRATANTE pagará a título de valores convencionais ao CONTRATADO, o valor:

    1. VALOR: R$ 49,90
    2. FORMA DE PAGAMENTO: Honorários pactuados conforme negociação.

§ 1° - O atraso no pagamento por mais de 10 dias sujeitará ao Contratante a multa de 10% (dez por cento) sobre o valor a ser pago, mais a incidência de juros moratórios e juros compensatórios, considerados, ambos, individualmente, a razão de 1% (um por cento) ao mês. 
§ 2° - O critério de correção monetária, incidente sobre os valores deste contrato, será o resultante do IGPM/FGV. 
§ 3° - Custas e 20% de honorários advocatícios, caso o contrato precise ser executado judicial.
§ 4° - O contrato poderá ser reincidido pela parte contratada por falta de pagamento integral ou parcial dos valores ajustado, onde notificará a parte contratante extrajudicialmente para pagamento e regularização do débito em 10 dias, ou o presente serviço será suspenso, devendo a parte contratante nomear outrem.
§ 5º - Caso houver valores vinculados ao final do processo seja em fase de multa ou suspensão, será comunicado ao contratante a decisão e emitido boleto bancário com vencimento para 15 dias.
§ 6° - Em caso de pagamento a vista ou cartão de crédito, desconsiderar os parágrafos acima.

CLÁUSULA TERCEIRA – DA VIGÊNCIA E DEMAIS OBRIGAÇÕES: 
O termo inicial do presente contrato é o de sua assinatura, e terminará no finde do 
 ( x ) Auto de infração – Fase do AIT: (   ) SEPEN (   ) JARI (   ) CETRAN

    1. Todos os recursos serão revisados a pretensão de protocolo para os departamentos - SEPEN-JARI-CETRAN.
    2. Caso o auto esteja em fase do SEPEN- Iremos apresentar procuração e formular argumentos, e aguardar notificação para JARI e CETRAN, onde são analisados os méritos alegados em recurso.
    3. Caso vier ocorrer a distribuição do processo administrativo face a este auto de infração, ele está incluso neste contrato, posto o novo sistema do órgão autuador, onde em alguns casos possuem auto de infração para multa e outro processo para suspensão.
    4. A venda do veículo e demais procedimentos durante o trâmite do processo, é de responsabilidade do Contratante, visto que a multa até o julgamento definitivo, estará apenas suspensa.
    5. Não possui prazo estabelecido para julgamento dos recursos, visto dependermos do órgão julgador.
    6. A rescisão do contrato pela parte contratante após o protocolo do recurso, seja em fase SEPEN- JARI- CETRAN, não a exonera do pagamento, devendo os valores serem pagos em sua totalidade;

Data de Emissão: 08/01/2026

Status: PENDENTE DE ASSINATURA DIGITAL', NULL, '2026-01-08T21:18:54.420874+00:00', '2026-01-09T01:17:42.816+00:00', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 49.9, NULL, NULL, NULL, 'modelo_01', NULL, NULL, NULL, '[]'::jsonb, NULL, '2026-01-09T01:12:26.761421+00:00', NULL, NULL, FALSE, NULL, FALSE, FALSE) ON CONFLICT DO NOTHING;
INSERT INTO public."contratos" ("id", "cliente_id", "servico_id", "status", "conteudo", "assinatura_data", "created_at", "updated_at", "organization_id", "valor", "auto_infracao", "penalidades", "forma_pagamento", "modelo_slug", "processo_administrativo", "fase_ait", "fase_processo", "testemunhas", "data_ultima_notificacao", "data_protocolo", "intervalo_notificacao", "last_checkin_notified_at", "lembrete_ativado", "data_proximo_lembrete", "alerta_ativo", "lido") VALUES ('c06e9854-272d-450a-b18d-50c1c8138885', '25a8461f-7684-431a-a744-fb6a32674152', '55aedc8c-0254-4aa6-87ac-c97e1afca6d5', 'indeferido', 'CONTRATO DE PRESTAÇÃO DE SERVIÇO:

CONTRATANTE:
NOME: LEONARDO NETTO PEREIRA
ESTADO CIVIL: casado
PROFISSÃO: DESENVOLVEDOR
NACIONALIDADE: Brasileira
DOCUMENTO: CPF: 05313070770
RG/IE: 118543107
ENDEREÇO: Rua Frederico Cornélio, 1666 - campinho, Belo Horizonte/MG - CEP: 21321060
TELEFONE: 21970402529
E-MAIL: dra.cintiaborges@gmail.com


CONTRATADO: ZAPMATIC TECH, pessoa jurídica de direito privado, devidamente inscrito no CNPJ: Não cadastrado, representado neste ato por seu sócio proprietário, com escritório profissional a Endereço da empresa.

CLÁUSULA PRIMEIRA – DAS OBRIGAÇÕES DO CONTRATADO: 
A parte Contratada obriga-se, a prestar seus serviços profissionais: 

Nº do Auto de Infração: Nº AUTO: nhfyyr  fnnrnrrrr
Nesses autos serão discutidas as penalidades: multa.

CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO(A) CONTRATANTE: 
Em remuneração dos serviços descritos na cláusula anterior, o CONTRATANTE pagará a título de valores convencionais ao CONTRATADO, o valor:

    1. VALOR: R$ 150,00
    2. FORMA DE PAGAMENTO: 10x 159,00

§ 1° - O atraso no pagamento por mais de 10 dias sujeitará ao Contratante a multa de 10% (dez por cento) sobre o valor a ser pago, mais a incidência de juros moratórios e juros compensatórios, considerados, ambos, individualmente, a razão de 1% (um por cento) ao mês. 
§ 2° - O critério de correção monetária, incidente sobre os valores deste contrato, será o resultante do IGPM/FGV. 
§ 3° - Custas e 20% de honorários advocatícios, caso o contrato precise ser executado judicial.
§ 4° - O contrato poderá ser reincidido pela parte contratada por falta de pagamento integral ou parcial dos valores ajustado, onde notificará a parte contratante extrajudicialmente para pagamento e regularização do débito em 10 dias, ou o presente serviço será suspenso, devendo a parte contratante nomear outrem.
§ 5º - Caso houver valores vinculados ao final do processo seja em fase de multa ou suspensão, será comunicado ao contratante a decisão e emitido boleto bancário com vencimento para 15 dias.
§ 6° - Em caso de pagamento a vista ou cartão de crédito, desconsiderar os parágrafos acima.

CLÁUSULA TERCEIRA – DA VIGÊNCIA E DEMAIS OBRIGAÇÕES: 
O termo inicial do presente contrato é o de sua assinatura, e terminará no finde do 
 ( x ) Auto de infração – Fase do AIT: ( X )  SEPEN (   ) JARI  (   ) CETRAN

    1. Todos os recursos serão revisados a pretensão de protocolo para os departamentos - SEPEN-JARI-CETRAN.
    2. Caso o auto esteja em fase do SEPEN- Iremos apresentar procuração e formular argumentos, e aguardar notificação para JARI e CETRAN, onde são analisados os méritos alegados em recurso.
    3. Caso vier ocorrer a distribuição do processo administrativo face a este auto de infração, ele está incluso neste contrato, posto o novo sistema do órgão autuador, onde em alguns casos possuem auto de infração para multa e outro processo para suspensão.
    4. A venda do veículo e demais procedimentos durante o trâmite do processo, é de responsabilidade do Contratante, visto que a multa até o julgamento definitivo, estará apenas suspensa.
    5. Não possui prazo estabelecido para julgamento dos recursos, visto dependermos do órgão julgador.
    6. A rescisão do contrato pela parte contratante após o protocolo do recurso, seja em fase SEPEN- JARI- CETRAN, não a exonera do pagamento, devendo os valores serem pagos em sua totalidade;

Data de Emissão: 08/01/2026

Status: PENDENTE DE ASSINATURA DIGITAL', NULL, '2026-01-08T19:25:26.234315+00:00', '2026-01-09T01:17:48.016+00:00', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 150.0, 'nhfyyr  fnnrnrrrr', 'multa', '10x 159,00', 'modelo_01', NULL, NULL, NULL, '[]'::jsonb, NULL, '2026-01-09T01:12:26.761421+00:00', NULL, NULL, FALSE, NULL, FALSE, FALSE) ON CONFLICT DO NOTHING;
INSERT INTO public."contratos" ("id", "cliente_id", "servico_id", "status", "conteudo", "assinatura_data", "created_at", "updated_at", "organization_id", "valor", "auto_infracao", "penalidades", "forma_pagamento", "modelo_slug", "processo_administrativo", "fase_ait", "fase_processo", "testemunhas", "data_ultima_notificacao", "data_protocolo", "intervalo_notificacao", "last_checkin_notified_at", "lembrete_ativado", "data_proximo_lembrete", "alerta_ativo", "lido") VALUES ('b5faa027-03dc-405d-8632-cc1379be90cd', '25a8461f-7684-431a-a744-fb6a32674152', '55aedc8c-0254-4aa6-87ac-c97e1afca6d5', 'indeferido', 'Contrato de prestação de serviço: Recurso de Multa - Defesa Prévia', NULL, '2026-01-08T19:02:57.737593+00:00', '2026-01-09T01:17:50.32+00:00', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 150.0, NULL, NULL, NULL, 'padrao', NULL, NULL, NULL, '[]'::jsonb, NULL, '2026-01-09T01:12:26.761421+00:00', NULL, NULL, FALSE, NULL, FALSE, FALSE) ON CONFLICT DO NOTHING;
INSERT INTO public."contratos" ("id", "cliente_id", "servico_id", "status", "conteudo", "assinatura_data", "created_at", "updated_at", "organization_id", "valor", "auto_infracao", "penalidades", "forma_pagamento", "modelo_slug", "processo_administrativo", "fase_ait", "fase_processo", "testemunhas", "data_ultima_notificacao", "data_protocolo", "intervalo_notificacao", "last_checkin_notified_at", "lembrete_ativado", "data_proximo_lembrete", "alerta_ativo", "lido") VALUES ('01cd8843-6382-43a8-a361-eb8c03e6b079', '25a8461f-7684-431a-a744-fb6a32674152', '48bd11e3-9c8e-490d-b734-c93ae45422d3', 'indeferido', 'Contrato de prestação de serviço: Acompanhamento Mensal de Multas', NULL, '2026-01-08T19:02:29.898177+00:00', '2026-01-09T01:17:51.544+00:00', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 49.9, NULL, NULL, NULL, 'padrao', NULL, NULL, NULL, '[]'::jsonb, NULL, '2026-01-09T01:12:26.761421+00:00', NULL, NULL, FALSE, NULL, FALSE, FALSE) ON CONFLICT DO NOTHING;
INSERT INTO public."contratos" ("id", "cliente_id", "servico_id", "status", "conteudo", "assinatura_data", "created_at", "updated_at", "organization_id", "valor", "auto_infracao", "penalidades", "forma_pagamento", "modelo_slug", "processo_administrativo", "fase_ait", "fase_processo", "testemunhas", "data_ultima_notificacao", "data_protocolo", "intervalo_notificacao", "last_checkin_notified_at", "lembrete_ativado", "data_proximo_lembrete", "alerta_ativo", "lido") VALUES ('ceae5eff-f52e-4c98-b6de-3b2548c9c815', '25a8461f-7684-431a-a744-fb6a32674152', '48bd11e3-9c8e-490d-b734-c93ae45422d3', 'aguardando_julgamento', 'CONTRATO DE PRESTAÇÃO DE SERVIÇO:

CONTRATANTE:
NOME: LEONARDO NETTO PEREIRA
ESTADO CIVIL: casado
PROFISSÃO: DESENVOLVEDOR
NACIONALIDADE: Brasileira
CPF: 05313070770
RG: 118543107
ENDEREÇO: Rua Frederico Cornélio, 1666 – campinho – Belo Horizonte/MG – CEP: 21321060
TELEFONE: 21970402529
E-MAIL: dra.cintiaborges@gmail.com

CONTRATADO: ZAPMATIC TECH, pessoa jurídica de direito privado, devidamente inscrito no CNPJ: Não cadastrado, representado neste ato por seu sócio proprietário, com escritório profissional a Endereço da empresa.

CLÁUSULA PRIMEIRA – DAS OBRIGAÇÕES DO CONTRATADO: 
A parte Contratada obriga-se, a prestar seus serviços profissionais: 

Nº do Auto de Infração: Nº AUTO: rrrttttr
Nesses autos serão discutidas as penalidades: rrrrrrrr.

CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO(A) CONTRATANTE: 
Em remuneração dos serviços descritos na cláusula anterior, o CONTRATANTE pagará a título de valores convencionais ao CONTRATADO, o valor:

    1. VALOR: R$ 49,90
    2. FORMA DE PAGAMENTO: rrrrrrrrrr

§ 1° - O atraso no pagamento por mais de 10 dias sujeitará ao Contratante a multa de 10% (dez por cento) sobre o valor a ser pago, mais a incidência de juros moratórios e juros compensatórios, considerados, ambos, individualmente, a razão de 1% (um por cento) ao mês. 
§ 2° - O critério de correção monetária, incidente sobre os valores deste contrato, será o resultante do IGPM/FGV. 
§ 3° - Custas e 20% de honorários advocatícios, caso o contrato precise ser executado judicial.
§ 4° - O contrato poderá ser reincidido pela parte contratada por falta de pagamento integral ou parcial dos valores ajustado, onde notificará a parte contratante extrajudicialmente para pagamento e regularização do débito em 10 dias, ou o presente serviço será suspenso, devendo a parte contratante nomear outrem.
§ 5º - Caso houver valores vinculados ao final do processo seja em fase de multa ou suspensão, será comunicado ao contratante a decisão e emitido boleto bancário com vencimento para 15 dias.
§ 6° - Em caso de pagamento a vista ou cartão de crédito, desconsiderar os parágrafos acima.

CLÁUSULA TERCEIRA – DA VIGÊNCIA E DEMAIS OBRIGAÇÕES: 
O termo inicial do presente contrato é o de sua assinatura, e terminará no finde do 
 ( x ) Auto de infração – Fase do AIT: ( X ) SEPEN

    1. Todos os recursos serão revisados a pretensão de protocolo para os departamentos - SEPEN-JARI-CETRAN.
    2. Caso o auto esteja em fase do SEPEN- Iremos apresentar procuração e formular argumentos, e aguardar notificação para JARI e CETRAN, onde são analisados os méritos alegados em recurso.
    3. Caso vier ocorrer a distribuição do processo administrativo face a este auto de infração, ele está incluso neste contrato, posto o novo sistema do órgão autuador, onde em alguns casos possuem auto de infração para multa e outro processo para suspensão.
    4. A venda do veículo e demais procedimentos durante o trâmite do processo, é de responsabilidade do Contratante, visto que a multa até o julgamento definitivo, estará apenas suspensa.
    5. Não possui prazo estabelecido para julgamento dos recursos, visto dependermos do órgão julgador.
    6. A rescisão do contrato pela parte contratante após o protocolo do recurso, seja em fase SEPEN- JARI- CETRAN, não a exonera do pagamento, devendo os valores serem pagos em sua totalidade;

Data de Emissão: 08/01/2026

Status: PENDENTE DE ASSINATURA DIGITAL', NULL, '2026-01-08T21:25:56.747367+00:00', '2026-01-09T01:19:00.137+00:00', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 49.9, 'rrrttttr', 'rrrrrrrr', 'rrrrrrrrrr', 'modelo_01', NULL, 'SEPEN', NULL, '[]'::jsonb, NULL, '2026-01-09T01:12:26.761421+00:00', NULL, NULL, FALSE, NULL, FALSE, FALSE) ON CONFLICT DO NOTHING;
INSERT INTO public."contratos" ("id", "cliente_id", "servico_id", "status", "conteudo", "assinatura_data", "created_at", "updated_at", "organization_id", "valor", "auto_infracao", "penalidades", "forma_pagamento", "modelo_slug", "processo_administrativo", "fase_ait", "fase_processo", "testemunhas", "data_ultima_notificacao", "data_protocolo", "intervalo_notificacao", "last_checkin_notified_at", "lembrete_ativado", "data_proximo_lembrete", "alerta_ativo", "lido") VALUES ('9cc63358-5956-4a97-b75b-2fc76687f8ff', '25a8461f-7684-431a-a744-fb6a32674152', '48bd11e3-9c8e-490d-b734-c93ae45422d3', 'aguardando_julgamento', 'CONTRATO DE PRESTAÇÃO DE SERVIÇO:

CONTRATANTE:
NOME: LEONARDO NETTO PEREIRA
ESTADO CIVIL: casado
PROFISSÃO: DESENVOLVEDOR
NACIONALIDADE: BRASILEIRO
CPF: 05313070770
RG: 118543107
ENDEREÇO: Rua Frederico Cornélio, 1666 – campinho – Belo Horizonte/MG – CEP: 21321060
TELEFONE: 21970402529
E-MAIL: dra.cintiaborges@gmail.com

CONTRATADO: ZAPMATIC TECH, pessoa jurídica de direito privado, devidamente inscrito no CNPJ: Não cadastrado, representado neste ato por seu sócio proprietário, com escritório profissional a Endereço da empresa.

CLÁUSULA PRIMEIRA – DAS OBRIGAÇÕES DO CONTRATADO: 
A parte Contratada obriga-se, a prestar seus serviços profissionais: 

Nº do Auto de Infração: Nº AUTO: ttoodiirkrkrrr
Nesses autos serão discutidas apenas a penalidade da multa.

CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO(A) CONTRATANTE: 
Em remuneração dos serviços descritos na cláusula anterior, o CONTRATANTE pagará a título de valores convencionais ao CONTRATADO, o valor: 

    1. VALOR: R$ 49,90
    2. FORMA DE PAGAMENTO: em 10 x no cartao

§ 1° - O atraso no pagamento por mais de 10 dias sujeitará ao Contratante a multa de 10% (dez por cento) sobre o valor a ser pago, mais a incidência de juros moratórios e juros compensatórios, considerados, ambos, individualmente, a razão de 1% (um por cento) ao mês. 
§ 2° - O critério de correção monetária, incidente sobre os valores deste contrato, será o resultante do IGPM/FGV. 
§ 3° - Custas e 20% de honorários advocatícios, caso o contrato precise ser executado judicial.
§ 4° - O contrato poderá ser reincidido pela parte contratada por falta de pagamento integral ou parcial dos valores ajustado, onde notificará a parte contratante extrajudicialmente para pagamento e regularização do débito em 10 dias, ou o presente serviço será suspenso, devendo a parte contratante nomear outrem.
§ 5º - Caso houver valores vinculados ao final do processo seja em fase de multa ou suspensão, será comunicado ao contratante a decisão e emitido boleto bancário com vencimento para 15 dias.
§ 6° - Em caso de pagamento a vista ou cartão de crédito, desconsiderar os parágrafos acima.


CLÁUSULA TERCEIRA – DA VIGÊNCIA E DEMAIS OBRIGAÇÕES: 
O termo inicial do presente contrato é o de sua assinatura, e terminará no finde do 
 ( x ) Auto de infração – Fase do AIT: ( X ) SEPEN

    1. Todos os recursos serão revisados a pretensão de protocolo para os departamentos - SEPEN-JARI-CETRAN.
    2. Caso o auto esteja em fase do SEPEN- Iremos apresentar procuração e formular argumentos, e aguardar notificação para JARI e CETRAN, onde são analisados os méritos alegados em recurso.
    3. A venda do veículo e demais procedimentos durante o trâmite do processo, é de responsabilidade do Contratante, visto que a multa até o julgamento definitivo, estará apenas suspensa.
    4. Não possui prazo estabelecido para julgamento dos recursos, visto dependermos do órgão julgador.
    5. A rescisão do contrato pela parte contratante após o protocolo do recurso, seja em fase SEPEN- JARI- CETRAN, não a exonera do pagamento, devendo os valores serem pagos em sua totalidade;
    6. A desistência antes do protocolo, terá multa de R$ 500,00, posto o estudo dedicado ao caso concreto.
    7. O Contratado contratará serviços advocatícios para realização dos recursos, tratando-se a atividade advocatícia meio e não fim.
    8. Não está incluso neste contrato, caso haja necessidade da via judicial.
    9. As notificações do auto de infração, são enviados pelo órgão autuador diretamente para o endereço cadastrado do Condutor ou CNH digital quando em fase de multa, devendo este comunicar a empresa contratada de imediato da abertura do prazo.
    10. Os órgãos autuadores NÃO notificam a parte outorgada e contratada, apenas o contratante, sendo deste a responsabilidade de comunicar a empresa ZAPMATIC TECH.
    11. O contratante deve manter o endereço atualizado no Detran de registro da sua CNH, posto que as notificações vão para o endereço fornecido ao órgão.
    12. É de responsabilidade do contratante o fornecimento de todos os documentos necessários e obrigatórios para o protocolo e conhecimento do recurso, bem como informar das notificações.


CLÁUSULA QUARTA – DO FORO: 
As partes contratantes elegem o Foro da Comarca de Campo Grande - MS, para eventual solução de quaisquer questões decorrentes da execução deste contrato. 

Campo Grande/MS, 08/01/2026

Status: PENDENTE DE ASSINATURA', NULL, '2026-01-08T21:14:49.103185+00:00', '2026-01-09T09:18:34.664+00:00', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 49.9, 'ttoodiirkrkrrr', NULL, 'em 10 x no cartao', 'modelo_04', NULL, 'SEPEN', NULL, '[]'::jsonb, '2026-01-09T01:19:50.367+00:00', '2026-01-09T01:12:26.761421+00:00', NULL, NULL, FALSE, NULL, FALSE, FALSE) ON CONFLICT DO NOTHING;
INSERT INTO public."contratos" ("id", "cliente_id", "servico_id", "status", "conteudo", "assinatura_data", "created_at", "updated_at", "organization_id", "valor", "auto_infracao", "penalidades", "forma_pagamento", "modelo_slug", "processo_administrativo", "fase_ait", "fase_processo", "testemunhas", "data_ultima_notificacao", "data_protocolo", "intervalo_notificacao", "last_checkin_notified_at", "lembrete_ativado", "data_proximo_lembrete", "alerta_ativo", "lido") VALUES ('99b1f052-9169-4bca-be6f-aa4f59df961f', '222fc38c-0702-477e-8f91-5d083ad19007', '5f15f2bc-8327-47a7-9114-fb7b976963cf', 'pendente', 'CONTRATO DE PRESTAÇÃO DE SERVIÇO:

CONTRATANTE:
NOME: LEONARDO NETTO
ESTADO CIVIL: Não informado
PROFISSÃO: Não informado
NACIONALIDADE: BRASILEIRO
CPF: null
RG: Não informado
ENDEREÇO: Endereço não informado
TELEFONE: 21970402529
E-MAIL: dra.cintiaborges@gmail.com

CONTRATADO: ZAPMATIC TECH, pessoa jurídica de direito privado, devidamente inscrito no CNPJ: Não cadastrado, representado neste ato por seu sócio proprietário, com escritório profissional a Endereço da empresa.

CLÁUSULA PRIMEIRA – DAS OBRIGAÇÕES DO CONTRATADO: 
A parte Contratada obriga-se, a prestar seus serviços profissionais: 

Nº do Auto de Infração: Nº AUTO: 22222222222
Nesses autos serão discutidas apenas a penalidade da multa.

CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO(A) CONTRATANTE: 
Em remuneração dos serviços descritos na cláusula anterior, o CONTRATANTE pagará a título de valores convencionais ao CONTRATADO, o valor: 

    1. VALOR: R$ 1200,00
    2. FORMA DE PAGAMENTO: 1

§ 1° - O atraso no pagamento por mais de 10 dias sujeitará ao Contratante a multa de 10% (dez por cento) sobre o valor a ser pago, mais a incidência de juros moratórios e juros compensatórios, considerados, ambos, individualmente, a razão de 1% (um por cento) ao mês. 
§ 2° - O critério de correção monetária, incidente sobre os valores deste contrato, será o resultante do IGPM/FGV. 
§ 3° - Custas e 20% de honorários advocatícios, caso o contrato precise ser executado judicial.
§ 4° - O contrato poderá ser reincidido pela parte contratada por falta de pagamento integral ou parcial dos valores ajustado, onde notificará a parte contratante extrajudicialmente para pagamento e regularização do débito em 10 dias, ou o presente serviço será suspenso, devendo a parte contratante nomear outrem.
§ 5º - Caso houver valores vinculados ao final do processo seja em fase de multa ou suspensão, será comunicado ao contratante a decisão e emitido boleto bancário com vencimento para 15 dias.
§ 6° - Em caso de pagamento a vista ou cartão de crédito, desconsiderar os parágrafos acima.


CLÁUSULA TERCEIRA – DA VIGÊNCIA E DEMAIS OBRIGAÇÕES: 
O termo inicial do presente contrato é o de sua assinatura, e terminará no finde do 
 ( x ) Auto de infração – Fase do AIT: ( X ) SEPEN

    1. Todos os recursos serão revisados a pretensão de protocolo para os departamentos - SEPEN-JARI-CETRAN.
    2. Caso o auto esteja em fase do SEPEN- Iremos apresentar procuração e formular argumentos, e aguardar notificação para JARI e CETRAN, onde são analisados os méritos alegados em recurso.
    3. A venda do veículo e demais procedimentos durante o trâmite do processo, é de responsabilidade do Contratante, visto que a multa até o julgamento definitivo, estará apenas suspensa.
    4. Não possui prazo estabelecido para julgamento dos recursos, visto dependermos do órgão julgador.
    5. A rescisão do contrato pela parte contratante após o protocolo do recurso, seja em fase SEPEN- JARI- CETRAN, não a exonera do pagamento, devendo os valores serem pagos em sua totalidade;
    6. A desistência antes do protocolo, terá multa de R$ 500,00, posto o estudo dedicado ao caso concreto.
    7. O Contratado contratará serviços advocatícios para realização dos recursos, tratando-se a atividade advocatícia meio e não fim.
    8. Não está incluso neste contrato, caso haja necessidade da via judicial.
    9. As notificações do auto de infração, são enviados pelo órgão autuador diretamente para o endereço cadastrado do Condutor ou CNH digital quando em fase de multa, devendo este comunicar a empresa contratada de imediato da abertura do prazo.
    10. Os órgãos autuadores NÃO notificam a parte outorgada e contratada, apenas o contratante, sendo deste a responsabilidade de comunicar a empresa ZAPMATIC TECH.
    11. O contratante deve manter o endereço atualizado no Detran de registro da sua CNH, posto que as notificações vão para o endereço fornecido ao órgão.
    12. É de responsabilidade do contratante o fornecimento de todos os documentos necessários e obrigatórios para o protocolo e conhecimento do recurso, bem como informar das notificações.


CLÁUSULA QUARTA – DO FORO: 
As partes contratantes elegem o Foro da Comarca de Campo Grande - MS, para eventual solução de quaisquer questões decorrentes da execução deste contrato. 

Campo Grande/MS, 09/01/2026

Status: PENDENTE DE ASSINATURA', NULL, '2026-01-09T14:44:19.635472+00:00', '2026-01-09T19:59:11.596+00:00', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 300.0, '22222222222', NULL, '1', 'modelo_04', NULL, 'SEPEN', 'SEPEN', '[]'::jsonb, NULL, '2026-01-09T14:44:19.635472+00:00', 0, NULL, TRUE, '2026-01-09T22:57:00+00:00', FALSE, FALSE) ON CONFLICT DO NOTHING;
INSERT INTO public."contratos" ("id", "cliente_id", "servico_id", "status", "conteudo", "assinatura_data", "created_at", "updated_at", "organization_id", "valor", "auto_infracao", "penalidades", "forma_pagamento", "modelo_slug", "processo_administrativo", "fase_ait", "fase_processo", "testemunhas", "data_ultima_notificacao", "data_protocolo", "intervalo_notificacao", "last_checkin_notified_at", "lembrete_ativado", "data_proximo_lembrete", "alerta_ativo", "lido") VALUES ('af4072df-1805-4dc0-8545-037731ba9111', '25a8461f-7684-431a-a744-fb6a32674152', '5f15f2bc-8327-47a7-9114-fb7b976963cf', 'aguardando_julgamento', 'CONTRATO DE PRESTAÇÃO DE SERVIÇO:

CONTRATANTE:
NOME: LEONARDO NETTO PEREIRA
ESTADO CIVIL: casado
PROFISSÃO: DESENVOLVEDOR
NACIONALIDADE: BRASILEIRO
CPF: 05313070770
RG: 118543107
ENDEREÇO: Rua Frederico Cornélio, 1666 – campinho – Belo Horizonte/MG – CEP: 21321060
TELEFONE: 21970402529
E-MAIL: dra.cintiaborges@gmail.com

CONTRATADO: ZAPMATIC TECH, pessoa jurídica de direito privado, devidamente inscrito no CNPJ: Não cadastrado, representado neste ato por seu sócio proprietário, com escritório profissional a Endereço da empresa.

CLÁUSULA PRIMEIRA – DAS OBRIGAÇÕES DO CONTRATADO: 
A parte Contratada obriga-se, a prestar seus serviços profissionais: 

Nº DO AUTO DE INFRAÇÃO: Nº AUTO: ___________

PROCESSO ADMINISTRATIVO: ___________

Nesses autos serão discutidas as penalidades:

Auto de Infração: MULTA;
Processo Administrativo: SUSPENSÃO, curso de reciclagem e prova;

CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO(A) CONTRATANTE: 
Em remuneração dos serviços descritos na cláusula anterior, o CONTRATANTE pagará a título de valores convencionais ao CONTRATADO, o valor: R$ 300,00

    • FORMA DE PAGAMENTO: Honorários pactuados conforme negociação.

§ 1° - O atraso no pagamento por mais de 10 dias sujeitará ao Contratante a multa de 10% (dez por cento) sobre o valor a ser pago, mais a incidência de juros moratórios e juros compensatórios, considerados, ambos, individualmente, a razão de 1% (um por cento) ao mês. 
§ 2° - O critério de correção monetária, incidente sobre os valores deste contrato, será o resultante do IGPM/FGV. 
§ 3° - Custas e 20% de honorários advocatícios, caso o contrato precise ser executado judicial.
§ 4° - O contrato poderá ser reincidido pela parte contratada por falta de pagamento integral ou parcial dos valores ajustado, onde notificará a parte contratante extrajudicialmente para pagamento e regularização do débito em 10 dias, ou o presente serviço será suspenso, devendo a parte contratante nomear outrem.
§ 5º - Caso houver valores vinculados ao final do processo seja em fase de multa ou suspensão, será comunicado ao contratante a decisão e emitido boleto bancário com vencimento para 15 dias.
§ 6° - Em caso de pagamento a vista ou cartão de crédito, desconsiderar os parágrafos acima.

CLÁUSULA TERCEIRA – DA VIGÊNCIA E DEMAIS OBRIGAÇÕES: 
O termo inicial do presente contrato é o de sua assinatura, e terminará no finde do 
 ( x ) Auto de infração – Fase do AIT: (   ) SEPEN (   ) JARI (   ) CETRAN
 ( x ) Processo Administrativo: (   ) SEPEN (   ) JARI (   ) CETRAN

    1. Todos os recursos serão revisados a pretensão de protocolo para os departamentos - SEPEN-JARI-CETRAN.
    2. Caso o auto de infração e o processo de suspensão estiverem em fase do SEPEN- Iremos apresentar procuração e formular argumentos, e aguardar notificação para JARI e CETRAN, onde são analisados os méritos alegados em recurso.
    3. A venda do veículo e demais procedimentos durante o trâmite do processo de multa, é de responsabilidade do Contratante, visto que a multa até o julgamento definitivo, estará apenas suspensa.
    4. Não possui prazo estabelecido para julgamento dos recursos, visto dependermos do órgão julgador.
    5. A rescisão do contrato pela parte contratante após o protocolo do recurso, seja em fase SEPEN- JARI- CETRAN, não a exonera do pagamento, devendo os valores serem pagos em sua totalidade;
    6. A desistência antes do protocolo, terá multa de R$ 500,00 (quinhentos reais), posto o estudo dedicado ao caso concreto.
    7. O Contratado contratará serviços advocatícios para realização dos recursos, tratando-se a atividade advocatícia meio e não fim.
    8. Não está incluso neste contrato, caso haja necessidade da via judicial.
    9. As notificações do auto de infração e do processo administrativo, são enviados pelo órgão autuador diretamente para o endereço cadastrado do Condutor ou CNH digital quando em fase de multa, devendo este comunicar a empresa contratada de imediato da abertura do prazo.
    10. Os órgãos autuadores NÃO notificam a parte outorgada e contratada, apenas o contratante, sendo de responsabilidade deste comunicar a empresa ZAPMATIC TECH de imediato.
    11. O contratante deve manter o endereço atualizado no Detran de registro da sua CNH, posto que as notificações vão para o endereço fornecido ao órgão.
    12. É de responsabilidade do contratante o fornecimento de todos os documentos necessários e obrigatórios para o protocolo e conhecimento do recurso, bem como informar das notificações.

CLÁUSULA QUARTA – DO FORO: 
As partes contratantes elegem o Foro da Comarca de Campo Grande - MS, para eventual solução de quaisquer questões decorrentes da execução deste contrato. 

Campo Grande/MS, 08/01/2026

Status: PENDENTE DE ASSINATURA', NULL, '2026-01-08T23:34:09.045646+00:00', '2026-01-09T20:13:44.51+00:00', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 300.0, NULL, NULL, NULL, 'modelo_02', NULL, NULL, NULL, '[]'::jsonb, '2026-01-09T09:49:58.146+00:00', '2026-01-09T01:12:26.761421+00:00', 1, '2026-01-09T09:49:58.146+00:00', FALSE, '2026-01-10T09:49:58.145+00:00', TRUE, TRUE) ON CONFLICT DO NOTHING;
INSERT INTO public."contratos" ("id", "cliente_id", "servico_id", "status", "conteudo", "assinatura_data", "created_at", "updated_at", "organization_id", "valor", "auto_infracao", "penalidades", "forma_pagamento", "modelo_slug", "processo_administrativo", "fase_ait", "fase_processo", "testemunhas", "data_ultima_notificacao", "data_protocolo", "intervalo_notificacao", "last_checkin_notified_at", "lembrete_ativado", "data_proximo_lembrete", "alerta_ativo", "lido") VALUES ('aff787af-db7c-4ce3-a83b-f4983de036e8', '83cfdd36-83b5-4c67-bddb-47b4d2ce64d5', '55aedc8c-0254-4aa6-87ac-c97e1afca6d5', 'indeferido', 'Contrato de Prestação de Serviços - Recurso de Multa - Defesa Prévia', '{"ip": "127.0.0.1", "data": "2026-01-16T15:54:01.341Z", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"}'::jsonb, '2026-01-16T15:52:24.835446+00:00', '2026-01-16T15:56:51.532+00:00', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 150.0, NULL, NULL, NULL, 'padrao', NULL, NULL, NULL, '[]'::jsonb, '2026-01-19T19:47:30.862+00:00', '2026-01-16T15:52:24.835446+00:00', NULL, NULL, FALSE, NULL, FALSE, FALSE) ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('68a6fff3-f9fb-4260-ad85-cee45c333d51', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Cliente desativado', '{"novo_status": false}'::jsonb, '2026-01-08T23:56:32.148025+00:00', '2026-01-08T23:56:32.148025+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('3a561b1c-dcc3-41cd-a1b0-f46b02c0a681', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Cliente ativado', '{"novo_status": true}'::jsonb, '2026-01-09T00:22:41.639905+00:00', '2026-01-09T00:22:41.639905+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('b0e921ec-1316-4c54-981e-34f460e9be89', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'cliente_editado', 'Dados cadastrais e endereço atualizados', '{"alteracoes": {"rg": "118543107", "cpf": "05313070770", "cnpj": null, "email": "dra.cintiaborges@gmail.com", "celular": "21970402529", "endereco": {"cep": "21321060", "bairro": "campinho", "cidade": "Belo Horizonte", "estado": "MG", "numero": "1666", "logradouro": "Rua Frederico Corn\u00e9lio", "complemento": ""}, "profissao": "DESENVOLVEDOR", "tipo_pessoa": "fisica", "estado_civil": "casado", "razao_social": null, "nome_completo": "LEONARDO NETTO PEREIRA", "nome_fantasia": null, "data_nascimento": "1982-07-09", "inscricao_estadual": null}}'::jsonb, '2026-01-09T00:22:54.773403+00:00', '2026-01-09T00:22:54.773403+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('aceb785a-482f-4ad0-a189-11688568dcd4', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'documento_enviado', '1 documento(s) enviado(s) com sucesso!', '{"count": 1}'::jsonb, '2026-01-09T00:33:28.491175+00:00', '2026-01-09T00:33:28.491175+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('8634b18a-1ffc-46a9-b93f-bcc2c3ef6aad', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'documento_enviado', '1 documento(s) enviado(s) com sucesso!', '{"count": 1}'::jsonb, '2026-01-09T00:38:08.139141+00:00', '2026-01-09T00:38:08.139141+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('0fdd52dc-2f21-4c66-884f-a99c8a8a999b', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato  alterado de pendente para aguardando_julgamento', '{}'::jsonb, '2026-01-09T01:15:53.614282+00:00', '2026-01-09T01:15:53.614282+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('d217d4d3-05c0-42c1-9d62-094320c81bdb', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato  alterado de aguardando_julgamento para deferido', '{}'::jsonb, '2026-01-09T01:17:25.892258+00:00', '2026-01-09T01:17:25.892258+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('5b55153b-2975-4950-bf47-70381d075322', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato rrrttttr alterado de pendente para deferido', '{}'::jsonb, '2026-01-09T01:17:40.859293+00:00', '2026-01-09T01:17:40.859293+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('08196113-b2b5-482c-bda5-f17f9b62f432', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato  alterado de pendente para aguardando_julgamento', '{}'::jsonb, '2026-01-09T01:17:43.05578+00:00', '2026-01-09T01:17:43.05578+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('3da98976-a8a6-424b-8dc6-67667de44312', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato ttoodiirkrkrrr alterado de pendente para deferido', '{}'::jsonb, '2026-01-09T01:17:45.799513+00:00', '2026-01-09T01:17:45.799513+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('89d04bdf-dce7-4a18-a72a-a624a43e0f13', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato nhfyyr  fnnrnrrrr alterado de pendente para indeferido', '{}'::jsonb, '2026-01-09T01:17:48.243614+00:00', '2026-01-09T01:17:48.243614+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('80f8b513-b1e6-4a48-98e6-161f6fbf68ee', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato  alterado de pendente para indeferido', '{}'::jsonb, '2026-01-09T01:17:50.544124+00:00', '2026-01-09T01:17:50.544124+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('cfd31880-03fc-412b-b956-a6a8ef6203b5', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato  alterado de pendente para indeferido', '{}'::jsonb, '2026-01-09T01:17:51.784359+00:00', '2026-01-09T01:17:51.784359+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('20f0420b-4dc4-44d3-8ba5-e80d602f730a', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato rrrttttr alterado de deferido para aguardando_julgamento', '{}'::jsonb, '2026-01-09T01:19:00.582675+00:00', '2026-01-09T01:19:00.582675+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('39c7bff2-8ae4-4117-9971-bc665c302973', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato ttoodiirkrkrrr alterado de deferido para aguardando_julgamento', '{}'::jsonb, '2026-01-09T01:19:03.376912+00:00', '2026-01-09T01:19:03.376912+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('e27cb086-3fd8-4806-bfa9-afa6d32ddee4', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Cliente desativado', '{"novo_status": false}'::jsonb, '2026-01-09T01:25:05.655415+00:00', '2026-01-09T01:25:05.655415+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('c43042a9-c776-4340-8ce2-7acf0fc66c9b', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Cliente ativado', '{"novo_status": true}'::jsonb, '2026-01-09T01:25:08.290558+00:00', '2026-01-09T01:25:08.290558+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('e4f67cb0-a4bd-4288-a322-2823f666b55b', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Intervalo de notificação do contrato  alterado para 7 dias', '{}'::jsonb, '2026-01-09T09:16:36.764049+00:00', '2026-01-09T09:16:36.764049+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('f2f6b0e9-cc89-458d-b636-6dc7d3b00e8e', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Intervalo de notificação do contrato  alterado para 1 dias', '{}'::jsonb, '2026-01-09T09:16:49.614403+00:00', '2026-01-09T09:16:49.614403+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('067ef78f-c315-4f7f-b3a8-6050ecc607c8', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato ttoodiirkrkrrr alterado de aguardando_julgamento para indeferido', '{}'::jsonb, '2026-01-09T09:18:27.063196+00:00', '2026-01-09T09:18:27.063196+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('44e53811-9d8a-4d49-93fc-f55e8832393f', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato ttoodiirkrkrrr alterado de indeferido para deferido', '{}'::jsonb, '2026-01-09T09:18:33.559757+00:00', '2026-01-09T09:18:33.559757+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('e7f742d0-5a18-46ba-8056-9b9125966195', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato ttoodiirkrkrrr alterado de deferido para aguardando_julgamento', '{}'::jsonb, '2026-01-09T09:18:34.855703+00:00', '2026-01-09T09:18:34.855703+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('42283111-cc09-4e21-879b-15773c96ddc6', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Notificações do contrato  ativadas', '{}'::jsonb, '2026-01-09T09:27:34.803556+00:00', '2026-01-09T09:27:34.803556+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('d69e8814-bad0-412a-a8f5-2a58f8fe2896', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Notificações do contrato  ativadas', '{}'::jsonb, '2026-01-09T09:27:37.223132+00:00', '2026-01-09T09:27:37.223132+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('799efdd2-9ed2-4ea7-aa1f-d8843b7d4d4e', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Notificações do contrato  ativadas', '{}'::jsonb, '2026-01-09T09:27:37.624604+00:00', '2026-01-09T09:27:37.624604+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('bbcaae84-9790-41b3-9213-6f864d67663c', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Notificações do contrato rrrttttr ativadas', '{}'::jsonb, '2026-01-09T09:27:39.884166+00:00', '2026-01-09T09:27:39.884166+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('ebca68fe-838e-4fb2-a2bb-0f9da0b23af8', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Notificações do contrato  ativadas', '{}'::jsonb, '2026-01-09T09:27:41.455834+00:00', '2026-01-09T09:27:41.455834+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('86871d95-5599-4969-ae1b-602dc497f307', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Notificações do contrato  ativadas', '{}'::jsonb, '2026-01-09T09:27:45.082718+00:00', '2026-01-09T09:27:45.082718+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('ae187143-e0ba-4189-8380-af521b4756d1', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Notificações do contrato  ativadas', '{}'::jsonb, '2026-01-09T09:27:45.521351+00:00', '2026-01-09T09:27:45.521351+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('df693308-9119-404d-aafb-0595eb2c88f4', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Notificações do contrato ttoodiirkrkrrr ativadas', '{}'::jsonb, '2026-01-09T09:27:47.2441+00:00', '2026-01-09T09:27:47.2441+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('da7aae1a-aea3-4106-a25f-1efe1b875727', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Notificações do contrato  ativadas', '{}'::jsonb, '2026-01-09T09:29:55.704292+00:00', '2026-01-09T09:29:55.704292+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('82761e8f-6dcf-44d2-8bcf-54f6bc3709c5', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Notificações do contrato  ativadas', '{}'::jsonb, '2026-01-09T09:29:57.689878+00:00', '2026-01-09T09:29:57.689878+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('63085221-fb71-403d-b6f1-386ee34506ec', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Notificações do contrato  ativadas', '{}'::jsonb, '2026-01-09T09:30:01.87047+00:00', '2026-01-09T09:30:01.87047+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('915c9a46-918b-44cd-a6b2-2c2ade67194d', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato  alterado de deferido para aguardando_julgamento', '{}'::jsonb, '2026-01-09T09:34:53.421878+00:00', '2026-01-09T09:34:53.421878+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('75aae54b-c1ed-4c8c-a44e-7fd602eaf60c', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Cliente desativado', '{"novo_status": false}'::jsonb, '2026-01-09T11:01:35.985726+00:00', '2026-01-09T11:01:35.985726+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('6de1647f-0a3b-4ca4-9df4-46fdae2514f9', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Cliente ativado', '{"novo_status": true}'::jsonb, '2026-01-09T11:05:16.534919+00:00', '2026-01-09T11:05:16.534919+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('5d89f684-3c08-4659-b26a-3a12a8034841', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Cliente desativado', '{"novo_status": false}'::jsonb, '2026-01-09T12:08:24.699111+00:00', '2026-01-09T12:08:24.699111+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('8b697e31-d4d3-4fc2-99e3-4128de1cda60', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Cliente ativado', '{"novo_status": true}'::jsonb, '2026-01-09T13:18:17.015076+00:00', '2026-01-09T13:18:17.015076+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('5dc5f273-edcf-4c66-8134-d53872371443', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Cliente desativado', '{"novo_status": false}'::jsonb, '2026-01-09T13:18:29.705769+00:00', '2026-01-09T13:18:29.705769+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('c25dc32f-aa1d-42d5-b645-d4defcf32a75', '222fc38c-0702-477e-8f91-5d083ad19007', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'documento_enviado', '1 documento(s) enviado(s) com sucesso!', '{"count": 1}'::jsonb, '2026-01-09T14:42:19.712016+00:00', '2026-01-09T14:42:19.712016+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('0127a4a2-55fa-44ae-b2ce-a1a51f5da32e', '222fc38c-0702-477e-8f91-5d083ad19007', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'contrato_criado', 'Contrato de AIT + Suspensão (Multa + Suspensão) gerado', '{"contrato_id": "99b1f052-9169-4bca-be6f-aa4f59df961f"}'::jsonb, '2026-01-09T14:44:19.768105+00:00', '2026-01-09T14:44:19.768105+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('c9fe4030-1e13-4681-a4e1-739f55d36be5', '222fc38c-0702-477e-8f91-5d083ad19007', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Notificações do contrato 22222222222 ativadas', '{}'::jsonb, '2026-01-09T19:56:22.581859+00:00', '2026-01-09T19:56:22.581859+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('b2819d85-2d28-4026-9c2f-1f250c73d1ad', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Notificações do contrato  desativadas', '{}'::jsonb, '2026-01-09T19:59:07.067094+00:00', '2026-01-09T19:59:07.067094+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('771813bb-5424-49ae-a106-1a613c3b067b', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Notificações do contrato  ativadas', '{}'::jsonb, '2026-01-09T20:13:43.532124+00:00', '2026-01-09T20:13:43.532124+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('a6e3b1c3-425a-4c02-a1f5-a281d85551d9', '25a8461f-7684-431a-a744-fb6a32674152', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'manual', 'Notificações do contrato  desativadas', '{}'::jsonb, '2026-01-09T20:13:44.707596+00:00', '2026-01-09T20:13:44.707596+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('dd58bed6-26ee-4c98-b278-c8bd3917a6ae', '83cfdd36-83b5-4c67-bddb-47b4d2ce64d5', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'documento_enviado', '1 documento(s) enviado(s) com sucesso!', '{"count": 1}'::jsonb, '2026-01-16T15:53:16.990305+00:00', '2026-01-16T15:53:16.990305+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('215d2c44-7c7e-4b8c-90ac-777378c0497b', '83cfdd36-83b5-4c67-bddb-47b4d2ce64d5', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato  alterado de assinado para aguardando_julgamento', '{}'::jsonb, '2026-01-16T15:54:46.055268+00:00', '2026-01-16T15:54:46.055268+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('829a9982-01c7-485d-8a18-c3514e7ac636', '83cfdd36-83b5-4c67-bddb-47b4d2ce64d5', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato  alterado de aguardando_julgamento para deferido', '{}'::jsonb, '2026-01-16T15:55:14.419175+00:00', '2026-01-16T15:55:14.419175+00:00') ON CONFLICT DO NOTHING;
INSERT INTO public."historico_atividades" ("id", "cliente_id", "organization_id", "tipo", "descricao", "metadata", "created_at", "updated_at") VALUES ('0d12309b-232d-41c2-b873-7d23388a3667', '83cfdd36-83b5-4c67-bddb-47b4d2ce64d5', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'status_alterado', 'Status do contrato  alterado de deferido para indeferido', '{}'::jsonb, '2026-01-16T15:55:15.028249+00:00', '2026-01-16T15:55:15.028249+00:00') ON CONFLICT DO NOTHING;