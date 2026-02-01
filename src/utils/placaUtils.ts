// Mapeamento simplificado por faixa de letras das placas brasileiras
// Baseado na distribuição oficial do DENATRAN

const FAIXA_ESTADO: Array<{ inicio: string; fim: string; estado: string }> = [
  // Paraná
  { inicio: 'AAA', fim: 'BEZ', estado: 'PR' },
  // São Paulo
  { inicio: 'BFA', fim: 'GKI', estado: 'SP' },
  // Minas Gerais
  { inicio: 'GKJ', fim: 'HOZ', estado: 'MG' },
  // Mato Grosso do Sul
  { inicio: 'HPA', fim: 'HQE', estado: 'MS' },
  // Mato Grosso
  { inicio: 'HQF', fim: 'HTW', estado: 'MT' },
  // Ceará
  { inicio: 'HTX', fim: 'HZA', estado: 'CE' },
  // Rio Grande do Sul
  { inicio: 'IAA', fim: 'JDO', estado: 'RS' },
  // Bahia
  { inicio: 'JDP', fim: 'JKZ', estado: 'BA' },
  // Distrito Federal
  { inicio: 'JLA', fim: 'JMZ', estado: 'DF' },
  // Goiás
  { inicio: 'JNA', fim: 'KAZ', estado: 'GO' },
  // Rio de Janeiro
  { inicio: 'KBA', fim: 'LWR', estado: 'RJ' },
  // Santa Catarina
  { inicio: 'LWS', fim: 'MMM', estado: 'SC' },
  // Espírito Santo
  { inicio: 'MMN', fim: 'MTZ', estado: 'ES' },
  // Amazonas
  { inicio: 'MUA', fim: 'NAZ', estado: 'AM' },
  // Acre
  { inicio: 'NAA', fim: 'NBK', estado: 'AC' },
  // Rondônia
  { inicio: 'NBL', fim: 'NEZ', estado: 'RO' },
  // Roraima
  { inicio: 'NFA', fim: 'NJZ', estado: 'RR' },
  // Piauí
  { inicio: 'NKA', fim: 'NMZ', estado: 'PI' },
  // Pernambuco
  { inicio: 'NNA', fim: 'NQV', estado: 'PE' },
  // Tocantins
  { inicio: 'NQW', fim: 'NWZ', estado: 'TO' },
  // Rio Grande do Norte
  { inicio: 'NXA', fim: 'OAZ', estado: 'RN' },
  // Amapá
  { inicio: 'OBA', fim: 'OBZ', estado: 'AP' },
  // Pará
  { inicio: 'OCA', fim: 'ONZ', estado: 'PA' },
  // Maranhão
  { inicio: 'OOA', fim: 'OTZ', estado: 'MA' },
  // Paraíba
  { inicio: 'OUA', fim: 'PEZ', estado: 'PB' },
  // Alagoas
  { inicio: 'PFA', fim: 'QAZ', estado: 'AL' },
  // Sergipe
  { inicio: 'QBA', fim: 'QDZ', estado: 'SE' },
];

/**
 * Extrai o estado de uma placa brasileira
 * Funciona tanto com placas antigas (ABC-1234) quanto Mercosul (ABC1D23)
 */
export function getEstadoFromPlaca(placa: string): string | null {
  if (!placa) return null;
  
  // Remove caracteres especiais e converte para maiúsculas
  const placaLimpa = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  if (placaLimpa.length < 3) return null;
  
  // Pega as 3 primeiras letras
  const letras = placaLimpa.substring(0, 3);
  
  // Busca na faixa
  for (const faixa of FAIXA_ESTADO) {
    if (letras >= faixa.inicio && letras <= faixa.fim) {
      return faixa.estado;
    }
  }
  
  return null;
}

/**
 * Retorna o nome do estado a partir da sigla
 */
export function getNomeEstado(sigla: string): string {
  const estados: Record<string, string> = {
    'AC': 'Acre',
    'AL': 'Alagoas',
    'AP': 'Amapá',
    'AM': 'Amazonas',
    'BA': 'Bahia',
    'CE': 'Ceará',
    'DF': 'Distrito Federal',
    'ES': 'Espírito Santo',
    'GO': 'Goiás',
    'MA': 'Maranhão',
    'MT': 'Mato Grosso',
    'MS': 'Mato Grosso do Sul',
    'MG': 'Minas Gerais',
    'PA': 'Pará',
    'PB': 'Paraíba',
    'PR': 'Paraná',
    'PE': 'Pernambuco',
    'PI': 'Piauí',
    'RJ': 'Rio de Janeiro',
    'RN': 'Rio Grande do Norte',
    'RS': 'Rio Grande do Sul',
    'RO': 'Rondônia',
    'RR': 'Roraima',
    'SC': 'Santa Catarina',
    'SP': 'São Paulo',
    'SE': 'Sergipe',
    'TO': 'Tocantins',
  };
  
  return estados[sigla] || sigla;
}
