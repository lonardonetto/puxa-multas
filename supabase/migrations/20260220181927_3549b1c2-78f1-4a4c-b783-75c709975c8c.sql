
-- ════════════════════════════════════════════════
-- RESET FINANCEIRO E CONSULTAS
-- NÃO apaga: clientes, veiculos, contratos, recursos, multas, usuarios
-- ════════════════════════════════════════════════

-- 1. Zerar saldos de todas as organizações
UPDATE organizations
SET saldo_sacavel = 0,
    saldo_bonus   = 0;

-- 2. Apagar todos os registros de faturamento (extrato)
DELETE FROM faturamento;

-- 3. Apagar solicitações de recarga
DELETE FROM solicitacoes_recarga;

-- 4. Apagar solicitações de plano
DELETE FROM solicitacoes_plano;

-- 5. Apagar histórico de consultas de rastreamento
DELETE FROM consultas_rastreamento;

-- 6. Apagar notificações de recarga
DELETE FROM notificacoes_recarga;

-- 7. Apagar cobranças de rastreamento
DELETE FROM rastreamento_cobrancas;
