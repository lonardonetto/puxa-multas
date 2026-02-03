-- Adicionar novos campos na tabela veiculos para armazenar dados completos da API
ALTER TABLE public.veiculos
ADD COLUMN IF NOT EXISTS chassi TEXT,
ADD COLUMN IF NOT EXISTS cor TEXT,
ADD COLUMN IF NOT EXISTS municipio TEXT,
ADD COLUMN IF NOT EXISTS uf TEXT,
ADD COLUMN IF NOT EXISTS motor TEXT,
ADD COLUMN IF NOT EXISTS potencia TEXT,
ADD COLUMN IF NOT EXISTS cilindradas TEXT,
ADD COLUMN IF NOT EXISTS especie TEXT,
ADD COLUMN IF NOT EXISTS capacidade_passageiros TEXT,
ADD COLUMN IF NOT EXISTS quantidade_eixos TEXT,
ADD COLUMN IF NOT EXISTS caixa_cambio TEXT,
ADD COLUMN IF NOT EXISTS situacao_veiculo TEXT,
ADD COLUMN IF NOT EXISTS rastreamento_tipo TEXT DEFAULT 'mensal',
ADD COLUMN IF NOT EXISTS rastreamento_vencimento DATE,
ADD COLUMN IF NOT EXISTS ultima_sincronizacao TIMESTAMP WITH TIME ZONE;

-- Comentários para documentação
COMMENT ON COLUMN public.veiculos.chassi IS 'Número do chassi do veículo';
COMMENT ON COLUMN public.veiculos.cor IS 'Cor do veículo';
COMMENT ON COLUMN public.veiculos.municipio IS 'Município de registro';
COMMENT ON COLUMN public.veiculos.uf IS 'UF de registro';
COMMENT ON COLUMN public.veiculos.motor IS 'Código do motor';
COMMENT ON COLUMN public.veiculos.potencia IS 'Potência em cv';
COMMENT ON COLUMN public.veiculos.cilindradas IS 'Cilindradas do motor';
COMMENT ON COLUMN public.veiculos.especie IS 'Espécie do veículo (passageiro, carga, etc)';
COMMENT ON COLUMN public.veiculos.rastreamento_tipo IS 'Tipo de cobrança: mensal ou anual';
COMMENT ON COLUMN public.veiculos.rastreamento_vencimento IS 'Data de vencimento do rastreamento anual';
COMMENT ON COLUMN public.veiculos.ultima_sincronizacao IS 'Data da última sincronização automática de dados';