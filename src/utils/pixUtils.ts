/**
 * Gerador de Payload PIX (padrão EMV QRCPS-MPM do Banco Central do Brasil)
 */

function pad(id: number, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id.toString().padStart(2, '0')}${len}${value}`;
}

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return ((crc & 0xffff).toString(16).toUpperCase()).padStart(4, '0');
}

export interface PixConfig {
  chave: string;
  nome: string;
  cidade: string;
  valor?: number;
  txid?: string;
  descricao?: string;
}

export function gerarPayloadPix(config: PixConfig): string {
  const { chave, nome, cidade, valor, txid, descricao } = config;

  const merchantAccountInfo = pad(0, 'BR.GOV.BCB.PIX') + pad(1, chave) + (descricao ? pad(2, descricao) : '');
  const merchantAccountInfoField = pad(26, merchantAccountInfo);

  const payloadFormatIndicator = pad(0, '01');
  const pointOfInitiation = pad(1, '12'); // 12 = pode ser usado mais de uma vez
  const merchantCategoryCode = pad(52, '0000');
  const transactionCurrency = pad(53, '986');
  const transactionAmount = valor && valor > 0 ? pad(54, valor.toFixed(2)) : '';
  const countryCode = pad(58, 'BR');
  const merchantName = pad(59, nome.substring(0, 25));
  const merchantCity = pad(60, cidade.substring(0, 15));

  const txidValue = txid && txid.length > 0 ? txid.substring(0, 25) : '***';
  const additionalDataField = pad(62, pad(5, txidValue));

  const payload =
    payloadFormatIndicator +
    pointOfInitiation +
    merchantAccountInfoField +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmount +
    countryCode +
    merchantName +
    merchantCity +
    additionalDataField;

  const crc = crc16(payload + '6304');
  return payload + pad(63, crc);
}
