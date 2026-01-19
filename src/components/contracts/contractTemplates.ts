import type { Cliente } from '../../types/database';

interface OrganizationData {
    nome: string;
    cnpj?: string | null;
    endereco_completo?: string | null;
    representante_nome?: string;
}

interface ContractData {
    autoInfracao?: string;
    processoAdministrativo?: string;
    penalidades?: string;
    faseAit?: 'SEPEN' | 'JARI' | 'CETRAN';
    faseProcesso?: 'SEPEN' | 'JARI' | 'CETRAN';
    valor: number;
    formaPagamento?: string;
    dataContrato?: string;
    testemunhas?: Array<{ nome: string; cpf: string }>;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (date?: string) =>
    date || new Date().toLocaleDateString('pt-BR');

const getEnderecoFormatado = (cliente: Cliente) => {
    if (!cliente.endereco) return 'Endereço não informado';
    const e = cliente.endereco;
    return `${e.logradouro}, ${e.numero} – ${e.bairro} – ${e.cidade}/${e.estado} – CEP: ${e.cep}`;
};

/**
 * Modelo 01 - AIT + Suspensão (Multa + Suspensão)
 * Usado quando há Auto de Infração discutindo multa E suspensão
 */
export const gerarModelo01 = (
    cliente: Cliente,
    org: OrganizationData,
    data: ContractData
): string => {
    const doc = cliente.tipo_pessoa === 'fisica' ? `CPF: ${cliente.cpf}` : `CNPJ: ${cliente.cnpj}`;

    return `CONTRATO DE PRESTAÇÃO DE SERVIÇO:

CONTRATANTE:
NOME: ${cliente.nome_completo.toUpperCase()}
ESTADO CIVIL: ${cliente.estado_civil || 'Não informado'}
PROFISSÃO: ${cliente.profissao || 'Não informado'}
NACIONALIDADE: Brasileira
${doc}
RG: ${cliente.rg || 'Não informado'}
ENDEREÇO: ${getEnderecoFormatado(cliente)}
TELEFONE: ${cliente.celular}
E-MAIL: ${cliente.email}

CONTRATADO: ${org.nome}, pessoa jurídica de direito privado, devidamente inscrito no CNPJ: ${org.cnpj || 'Não cadastrado'}, representado neste ato por seu sócio proprietário${org.representante_nome ? ` ${org.representante_nome}` : ''}, com escritório profissional a ${org.endereco_completo || 'Endereço da empresa'}.

CLÁUSULA PRIMEIRA – DAS OBRIGAÇÕES DO CONTRATADO: 
A parte Contratada obriga-se, a prestar seus serviços profissionais: 

Nº do Auto de Infração: Nº AUTO: ${data.autoInfracao || '___________'}
Nesses autos serão discutidas as penalidades: ${data.penalidades || 'MULTA + SUSPENSÃO'}.

CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO(A) CONTRATANTE: 
Em remuneração dos serviços descritos na cláusula anterior, o CONTRATANTE pagará a título de valores convencionais ao CONTRATADO, o valor:

    1. VALOR: ${formatCurrency(data.valor)}
    2. FORMA DE PAGAMENTO: ${data.formaPagamento || 'Honorários pactuados conforme negociação.'}

§ 1° - O atraso no pagamento por mais de 10 dias sujeitará ao Contratante a multa de 10% (dez por cento) sobre o valor a ser pago, mais a incidência de juros moratórios e juros compensatórios, considerados, ambos, individualmente, a razão de 1% (um por cento) ao mês. 
§ 2° - O critério de correção monetária, incidente sobre os valores deste contrato, será o resultante do IGPM/FGV. 
§ 3° - Custas e 20% de honorários advocatícios, caso o contrato precise ser executado judicial.
§ 4° - O contrato poderá ser reincidido pela parte contratada por falta de pagamento integral ou parcial dos valores ajustado, onde notificará a parte contratante extrajudicialmente para pagamento e regularização do débito em 10 dias, ou o presente serviço será suspenso, devendo a parte contratante nomear outrem.
§ 5º - Caso houver valores vinculados ao final do processo seja em fase de multa ou suspensão, será comunicado ao contratante a decisão e emitido boleto bancário com vencimento para 15 dias.
§ 6° - Em caso de pagamento a vista ou cartão de crédito, desconsiderar os parágrafos acima.

CLÁUSULA TERCEIRA – DA VIGÊNCIA E DEMAIS OBRIGAÇÕES: 
O termo inicial do presente contrato é o de sua assinatura, e terminará no finde do 
 ( x ) Auto de infração – Fase do AIT: ${data.faseAit ? `( X ) ${data.faseAit}` : '(   ) SEPEN (   ) JARI (   ) CETRAN'}

    1. Todos os recursos serão revisados a pretensão de protocolo para os departamentos - SEPEN-JARI-CETRAN.
    2. Caso o auto esteja em fase do SEPEN- Iremos apresentar procuração e formular argumentos, e aguardar notificação para JARI e CETRAN, onde são analisados os méritos alegados em recurso.
    3. Caso vier ocorrer a distribuição do processo administrativo face a este auto de infração, ele está incluso neste contrato, posto o novo sistema do órgão autuador, onde em alguns casos possuem auto de infração para multa e outro processo para suspensão.
    4. A venda do veículo e demais procedimentos durante o trâmite do processo, é de responsabilidade do Contratante, visto que a multa até o julgamento definitivo, estará apenas suspensa.
    5. Não possui prazo estabelecido para julgamento dos recursos, visto dependermos do órgão julgador.
    6. A rescisão do contrato pela parte contratante após o protocolo do recurso, seja em fase SEPEN- JARI- CETRAN, não a exonera do pagamento, devendo os valores serem pagos em sua totalidade;

Data de Emissão: ${formatDate(data.dataContrato)}

Status: PENDENTE DE ASSINATURA DIGITAL`;
};

/**
 * Modelo 02 - AIT + Processo Administrativo já existente
 * Usado quando há Auto de Infração E Processo de Suspensão já aberto
 */
export const gerarModelo02 = (
    cliente: Cliente,
    org: OrganizationData,
    data: ContractData
): string => {
    const doc = cliente.tipo_pessoa === 'fisica' ? `CPF: ${cliente.cpf}` : `CNPJ: ${cliente.cnpj}`;

    return `CONTRATO DE PRESTAÇÃO DE SERVIÇO:

CONTRATANTE:
NOME: ${cliente.nome_completo.toUpperCase()}
ESTADO CIVIL: ${cliente.estado_civil || 'Não informado'}
PROFISSÃO: ${cliente.profissao || 'Não informado'}
NACIONALIDADE: BRASILEIRO
${doc}
RG: ${cliente.rg || 'Não informado'}
ENDEREÇO: ${getEnderecoFormatado(cliente)}
TELEFONE: ${cliente.celular}
E-MAIL: ${cliente.email}

CONTRATADO: ${org.nome}, pessoa jurídica de direito privado, devidamente inscrito no CNPJ: ${org.cnpj || 'Não cadastrado'}, representado neste ato por seu sócio proprietário${org.representante_nome ? ` ${org.representante_nome}` : ''}, com escritório profissional a ${org.endereco_completo || 'Endereço da empresa'}.

CLÁUSULA PRIMEIRA – DAS OBRIGAÇÕES DO CONTRATADO: 
A parte Contratada obriga-se, a prestar seus serviços profissionais: 

Nº DO AUTO DE INFRAÇÃO: Nº AUTO: ${data.autoInfracao || '___________'}

PROCESSO ADMINISTRATIVO: ${data.processoAdministrativo || '___________'}

Nesses autos serão discutidas as penalidades:

Auto de Infração: MULTA;
Processo Administrativo: SUSPENSÃO, curso de reciclagem e prova;

CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO(A) CONTRATANTE: 
Em remuneração dos serviços descritos na cláusula anterior, o CONTRATANTE pagará a título de valores convencionais ao CONTRATADO, o valor: ${formatCurrency(data.valor)}

    • FORMA DE PAGAMENTO: ${data.formaPagamento || 'Honorários pactuados conforme negociação.'}

§ 1° - O atraso no pagamento por mais de 10 dias sujeitará ao Contratante a multa de 10% (dez por cento) sobre o valor a ser pago, mais a incidência de juros moratórios e juros compensatórios, considerados, ambos, individualmente, a razão de 1% (um por cento) ao mês. 
§ 2° - O critério de correção monetária, incidente sobre os valores deste contrato, será o resultante do IGPM/FGV. 
§ 3° - Custas e 20% de honorários advocatícios, caso o contrato precise ser executado judicial.
§ 4° - O contrato poderá ser reincidido pela parte contratada por falta de pagamento integral ou parcial dos valores ajustado, onde notificará a parte contratante extrajudicialmente para pagamento e regularização do débito em 10 dias, ou o presente serviço será suspenso, devendo a parte contratante nomear outrem.
§ 5º - Caso houver valores vinculados ao final do processo seja em fase de multa ou suspensão, será comunicado ao contratante a decisão e emitido boleto bancário com vencimento para 15 dias.
§ 6° - Em caso de pagamento a vista ou cartão de crédito, desconsiderar os parágrafos acima.

CLÁUSULA TERCEIRA – DA VIGÊNCIA E DEMAIS OBRIGAÇÕES: 
O termo inicial do presente contrato é o de sua assinatura, e terminará no finde do 
 ( x ) Auto de infração – Fase do AIT: ${data.faseAit ? `( X ) ${data.faseAit}` : '(   ) SEPEN (   ) JARI (   ) CETRAN'}
 ( x ) Processo Administrativo: ${data.faseProcesso ? `( X ) ${data.faseProcesso}` : '(   ) SEPEN (   ) JARI (   ) CETRAN'}

    1. Todos os recursos serão revisados a pretensão de protocolo para os departamentos - SEPEN-JARI-CETRAN.
    2. Caso o auto de infração e o processo de suspensão estiverem em fase do SEPEN- Iremos apresentar procuração e formular argumentos, e aguardar notificação para JARI e CETRAN, onde são analisados os méritos alegados em recurso.
    3. A venda do veículo e demais procedimentos durante o trâmite do processo de multa, é de responsabilidade do Contratante, visto que a multa até o julgamento definitivo, estará apenas suspensa.
    4. Não possui prazo estabelecido para julgamento dos recursos, visto dependermos do órgão julgador.
    5. A rescisão do contrato pela parte contratante após o protocolo do recurso, seja em fase SEPEN- JARI- CETRAN, não a exonera do pagamento, devendo os valores serem pagos em sua totalidade;
    6. A desistência antes do protocolo, terá multa de R$ 500,00 (quinhentos reais), posto o estudo dedicado ao caso concreto.
    7. O Contratado contratará serviços advocatícios para realização dos recursos, tratando-se a atividade advocatícia meio e não fim.
    8. Não está incluso neste contrato, caso haja necessidade da via judicial.
    9. As notificações do auto de infração e do processo administrativo, são enviados pelo órgão autuador diretamente para o endereço cadastrado do Condutor ou CNH digital quando em fase de multa, devendo este comunicar a empresa contratada de imediato da abertura do prazo.
    10. Os órgãos autuadores NÃO notificam a parte outorgada e contratada, apenas o contratante, sendo de responsabilidade deste comunicar a empresa ${org.nome} de imediato.
    11. O contratante deve manter o endereço atualizado no Detran de registro da sua CNH, posto que as notificações vão para o endereço fornecido ao órgão.
    12. É de responsabilidade do contratante o fornecimento de todos os documentos necessários e obrigatórios para o protocolo e conhecimento do recurso, bem como informar das notificações.

CLÁUSULA QUARTA – DO FORO: 
As partes contratantes elegem o Foro da Comarca de Campo Grande - MS, para eventual solução de quaisquer questões decorrentes da execução deste contrato. 

${data.dataContrato ? `Campo Grande/MS, ${data.dataContrato}` : `Campo Grande/MS, ${formatDate()}`}

Status: PENDENTE DE ASSINATURA`;
};

/**
 * Modelo 04 - Apenas Multa
 * Usado quando discute-se exclusivamente a penalidade de multa
 */
export const gerarModelo04 = (
    cliente: Cliente,
    org: OrganizationData,
    data: ContractData
): string => {
    const doc = cliente.tipo_pessoa === 'fisica' ? `CPF: ${cliente.cpf}` : `CNPJ: ${cliente.cnpj}`;

    return `CONTRATO DE PRESTAÇÃO DE SERVIÇO:

CONTRATANTE:
NOME: ${cliente.nome_completo.toUpperCase()}
ESTADO CIVIL: ${cliente.estado_civil || 'Não informado'}
PROFISSÃO: ${cliente.profissao || 'Não informado'}
NACIONALIDADE: BRASILEIRO
${doc}
RG: ${cliente.rg || 'Não informado'}
ENDEREÇO: ${getEnderecoFormatado(cliente)}
TELEFONE: ${cliente.celular}
E-MAIL: ${cliente.email}

CONTRATADO: ${org.nome}, pessoa jurídica de direito privado, devidamente inscrito no CNPJ: ${org.cnpj || 'Não cadastrado'}, representado neste ato por seu sócio proprietário${org.representante_nome ? ` ${org.representante_nome}` : ''}, com escritório profissional a ${org.endereco_completo || 'Endereço da empresa'}.

CLÁUSULA PRIMEIRA – DAS OBRIGAÇÕES DO CONTRATADO: 
A parte Contratada obriga-se, a prestar seus serviços profissionais: 

Nº do Auto de Infração: Nº AUTO: ${data.autoInfracao || '___________'}
Nesses autos serão discutidas apenas a penalidade da multa.

CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO(A) CONTRATANTE: 
Em remuneração dos serviços descritos na cláusula anterior, o CONTRATANTE pagará a título de valores convencionais ao CONTRATADO, o valor: 

    1. VALOR: ${formatCurrency(data.valor)}
    2. FORMA DE PAGAMENTO: ${data.formaPagamento || 'Honorários pactuados conforme negociação.'}

§ 1° - O atraso no pagamento por mais de 10 dias sujeitará ao Contratante a multa de 10% (dez por cento) sobre o valor a ser pago, mais a incidência de juros moratórios e juros compensatórios, considerados, ambos, individualmente, a razão de 1% (um por cento) ao mês. 
§ 2° - O critério de correção monetária, incidente sobre os valores deste contrato, será o resultante do IGPM/FGV. 
§ 3° - Custas e 20% de honorários advocatícios, caso o contrato precise ser executado judicial.
§ 4° - O contrato poderá ser reincidido pela parte contratada por falta de pagamento integral ou parcial dos valores ajustado, onde notificará a parte contratante extrajudicialmente para pagamento e regularização do débito em 10 dias, ou o presente serviço será suspenso, devendo a parte contratante nomear outrem.
§ 5º - Caso houver valores vinculados ao final do processo seja em fase de multa ou suspensão, será comunicado ao contratante a decisão e emitido boleto bancário com vencimento para 15 dias.
§ 6° - Em caso de pagamento a vista ou cartão de crédito, desconsiderar os parágrafos acima.


CLÁUSULA TERCEIRA – DA VIGÊNCIA E DEMAIS OBRIGAÇÕES: 
O termo inicial do presente contrato é o de sua assinatura, e terminará no finde do 
 ( x ) Auto de infração – Fase do AIT: ${data.faseAit ? `( X ) ${data.faseAit}` : '(   ) SEPEN (   ) JARI (   ) CETRAN'}

    1. Todos os recursos serão revisados a pretensão de protocolo para os departamentos - SEPEN-JARI-CETRAN.
    2. Caso o auto esteja em fase do SEPEN- Iremos apresentar procuração e formular argumentos, e aguardar notificação para JARI e CETRAN, onde são analisados os méritos alegados em recurso.
    3. A venda do veículo e demais procedimentos durante o trâmite do processo, é de responsabilidade do Contratante, visto que a multa até o julgamento definitivo, estará apenas suspensa.
    4. Não possui prazo estabelecido para julgamento dos recursos, visto dependermos do órgão julgador.
    5. A rescisão do contrato pela parte contratante após o protocolo do recurso, seja em fase SEPEN- JARI- CETRAN, não a exonera do pagamento, devendo os valores serem pagos em sua totalidade;
    6. A desistência antes do protocolo, terá multa de R$ 500,00, posto o estudo dedicado ao caso concreto.
    7. O Contratado contratará serviços advocatícios para realização dos recursos, tratando-se a atividade advocatícia meio e não fim.
    8. Não está incluso neste contrato, caso haja necessidade da via judicial.
    9. As notificações do auto de infração, são enviados pelo órgão autuador diretamente para o endereço cadastrado do Condutor ou CNH digital quando em fase de multa, devendo este comunicar a empresa contratada de imediato da abertura do prazo.
    10. Os órgãos autuadores NÃO notificam a parte outorgada e contratada, apenas o contratante, sendo deste a responsabilidade de comunicar a empresa ${org.nome}.
    11. O contratante deve manter o endereço atualizado no Detran de registro da sua CNH, posto que as notificações vão para o endereço fornecido ao órgão.
    12. É de responsabilidade do contratante o fornecimento de todos os documentos necessários e obrigatórios para o protocolo e conhecimento do recurso, bem como informar das notificações.


CLÁUSULA QUARTA – DO FORO: 
As partes contratantes elegem o Foro da Comarca de Campo Grande - MS, para eventual solução de quaisquer questões decorrentes da execução deste contrato. 

${data.dataContrato ? `Campo Grande/MS, ${data.dataContrato}` : `Campo Grande/MS, ${formatDate()}`}

Status: PENDENTE DE ASSINATURA`;
};

/**
 * Modelo Procuração
 * Documento para representação em órgãos de trânsito
 */
export const gerarProcuracao = (
    cliente: Cliente,
    org: OrganizationData,
    advogado?: { nome: string; oab: string; cpf: string }
): string => {
    const doc = cliente.tipo_pessoa === 'fisica' ? cliente.cpf : cliente.cnpj;

    return `PROCURAÇÃO


OUTORGANTE: ${cliente.nome_completo.toUpperCase()}, nascido(a) ${cliente.data_nascimento ? new Date(cliente.data_nascimento).toLocaleDateString('pt-BR') : '___/___/______'}, brasileiro(a), ${cliente.estado_civil || 'estado civil não informado'}, ${cliente.profissao || 'profissão não informada'}, inscrito no CPF sob o nº ${doc}, portador(a) da carteira de identidade nº ${cliente.rg || '___________'}, e CNH nº ${(cliente as any).cnh || '___________'}, residente e domiciliado(a) na ${getEnderecoFormatado(cliente)}.

OUTORGADO: ${advogado?.nome || 'Dr(a). ___________'}, brasileiro(a), advogado(a), inscrito na OAB sob o nº ${advogado?.oab || '___________'}, e no CPF ${advogado?.cpf || '___________'}, com escritório profissional localizado em ${org.endereco_completo || 'Endereço do escritório'}.

PODERES: para representar a outorgante perante todos os órgãos de trânsito ou entidades, sejam estaduais, municipais e autarquias, também perante todos os órgãos do Poder Judiciário, em todos assuntos de seu interesse, utilizando os poderes da cláusula "ad judicia" e os especiais dos art. 359 do CPC e da parte final do art. 105 também do CPC de transigir, acordar, discordar, concordar, desistir, renunciar, firmar compromissos, como também, assinar, ter vista de processos, receber notificações, formular requerimentos, apresentar réplicas, apresentar defesas e impugnações administrativas e/ou judicialmente, extrajudicialmente em autos de infração e recursos administrativos, apresentar oposições ou recursos, solicitar retirada impedimentos, bloqueios e restrições, como também substabelecer esta, no todo ou em parte, enfim, praticar todos os atos necessários e em lei permitidos, para o fiel e completo desempenho deste mandado ficando ratificados demais atos eventualmente praticados, inclusive atos passados.

FINALIDADE: REPRESENTAÇÃO PERANTE TODOS OS ÓRGÃOS E AUTARQUIAS DE TRÂNSITO.

Campo Grande/MS, ${formatDate()}.




_________________________________
${cliente.nome_completo.toUpperCase()}`;
};

// Mapa de modelos disponíveis
export const CONTRACT_TEMPLATES = {
    modelo_01: {
        id: 'modelo_01',
        nome: 'AIT + Suspensão',
        descricao: 'Auto de Infração discutindo MULTA e SUSPENSÃO',
        gerador: gerarModelo01,
        campos: ['autoInfracao', 'penalidades', 'valor', 'formaPagamento', 'faseAit']
    },
    modelo_02: {
        id: 'modelo_02',
        nome: 'AIT + Processo Existente',
        descricao: 'Auto de Infração + Processo Administrativo já aberto',
        gerador: gerarModelo02,
        campos: ['autoInfracao', 'processoAdministrativo', 'valor', 'formaPagamento', 'faseAit', 'faseProcesso']
    },
    modelo_04: {
        id: 'modelo_04',
        nome: 'Apenas Multa',
        descricao: 'Discussão exclusiva da penalidade de multa',
        gerador: gerarModelo04,
        campos: ['autoInfracao', 'valor', 'formaPagamento', 'faseAit']
    },
    procuracao: {
        id: 'procuracao',
        nome: 'Procuração',
        descricao: 'Documento para representação em órgãos de trânsito',
        gerador: gerarProcuracao,
        campos: []
    }
} as const;

export type ContractTemplateId = keyof typeof CONTRACT_TEMPLATES;
