import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';
import type { Servico, ServicoInsert, ServicoUpdate } from '../types/database';

// Variáveis dinâmicas suportadas nos contratos
export const VARIAVEIS_CONTRATO = [
    { key: '{{NOME_CLIENTE}}', label: 'Nome do Cliente', descricao: 'Nome completo do cliente' },
    { key: '{{CPF_CLIENTE}}', label: 'CPF do Cliente', descricao: 'CPF formatado' },
    { key: '{{RG_CLIENTE}}', label: 'RG do Cliente', descricao: 'RG do cliente' },
    { key: '{{ENDERECO_CLIENTE}}', label: 'Endereço do Cliente', descricao: 'Endereço completo' },
    { key: '{{TELEFONE_CLIENTE}}', label: 'Telefone', descricao: 'Telefone do cliente' },
    { key: '{{EMAIL_CLIENTE}}', label: 'E-mail', descricao: 'E-mail do cliente' },
    { key: '{{DATA_ATUAL}}', label: 'Data Atual', descricao: 'Data de hoje formatada' },
    { key: '{{DATA_EXTENSO}}', label: 'Data por Extenso', descricao: 'Data por extenso (ex: 08 de janeiro de 2026)' },
    { key: '{{NOME_ORGANIZACAO}}', label: 'Nome da Organização', descricao: 'Nome da empresa/escritório' },
    { key: '{{CNPJ_ORGANIZACAO}}', label: 'CNPJ da Organização', descricao: 'CNPJ da empresa' },
    { key: '{{ENDERECO_ORGANIZACAO}}', label: 'Endereço da Organização', descricao: 'Endereço do escritório' },
    { key: '{{AUTO_INFRACAO}}', label: 'Auto de Infração', descricao: 'Número do auto de infração' },
    { key: '{{PLACA}}', label: 'Placa do Veículo', descricao: 'Placa do veículo' },
    { key: '{{VALOR_SERVICO}}', label: 'Valor do Serviço', descricao: 'Valor formatado do serviço' },
    { key: '{{NOME_SERVICO}}', label: 'Nome do Serviço', descricao: 'Nome do serviço contratado' },
] as const;

export type VariavelContrato = typeof VARIAVEIS_CONTRATO[number]['key'];

// Templates de contrato pré-definidos (formatados em HTML)
export const TEMPLATES_CONTRATO = [
    {
        id: 'modelo_01',
        nome: 'AIT + Suspensão (Multa + Suspensão)',
        descricao: 'Auto de Infração discutindo MULTA e SUSPENSÃO do direito de dirigir',
        contrato: `<h2 style="text-align: center; font-weight: bold; margin-bottom: 24px; font-size: 18px;">CONTRATO DE PRESTAÇÃO DE SERVIÇO</h2>

<p style="margin-bottom: 16px;"><strong>CONTRATANTE:</strong></p>
<p style="margin-bottom: 8px;">NOME: <strong>{{NOME_CLIENTE}}</strong></p>
<p style="margin-bottom: 8px;">CPF: {{CPF_CLIENTE}}</p>
<p style="margin-bottom: 8px;">RG: {{RG_CLIENTE}}</p>
<p style="margin-bottom: 8px;">ENDEREÇO: {{ENDERECO_CLIENTE}}</p>
<p style="margin-bottom: 8px;">TELEFONE: {{TELEFONE_CLIENTE}}</p>
<p style="margin-bottom: 16px;">E-MAIL: {{EMAIL_CLIENTE}}</p>

<p style="margin-bottom: 24px; text-align: justify;"><strong>CONTRATADO:</strong> {{NOME_ORGANIZACAO}}, pessoa jurídica de direito privado, devidamente inscrito no CNPJ: {{CNPJ_ORGANIZACAO}}, com escritório profissional em {{ENDERECO_ORGANIZACAO}}.</p>

<p style="margin-bottom: 12px;"><strong>CLÁUSULA PRIMEIRA – DAS OBRIGAÇÕES DO CONTRATADO:</strong></p>
<p style="margin-bottom: 12px; text-align: justify;">A parte Contratada obriga-se a prestar seus serviços profissionais:</p>
<p style="margin-bottom: 8px;">Nº do Auto de Infração: <strong>{{AUTO_INFRACAO}}</strong></p>
<p style="margin-bottom: 24px; text-align: justify;">Nesses autos serão discutidas as penalidades: <strong>MULTA + SUSPENSÃO</strong>.</p>

<p style="margin-bottom: 12px;"><strong>CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO(A) CONTRATANTE:</strong></p>
<p style="margin-bottom: 12px; text-align: justify;">Em remuneração dos serviços descritos na cláusula anterior, o CONTRATANTE pagará a título de valores convencionais ao CONTRATADO, o valor:</p>
<p style="margin-left: 24px; margin-bottom: 8px;">1. VALOR: <strong>{{VALOR_SERVICO}}</strong></p>
<p style="margin-left: 24px; margin-bottom: 16px;">2. FORMA DE PAGAMENTO: À vista ou conforme negociação.</p>

<p style="margin-bottom: 8px; text-align: justify;"><em>§ 1° - O atraso no pagamento por mais de 10 dias sujeitará ao Contratante a multa de 10% sobre o valor a ser pago, mais a incidência de juros moratórios de 1% ao mês.</em></p>
<p style="margin-bottom: 8px; text-align: justify;"><em>§ 2° - O critério de correção monetária será o resultante do IGPM/FGV.</em></p>
<p style="margin-bottom: 8px; text-align: justify;"><em>§ 3° - Custas e 20% de honorários advocatícios, caso o contrato precise ser executado judicialmente.</em></p>
<p style="margin-bottom: 24px; text-align: justify;"><em>§ 4° - O contrato poderá ser rescindido por falta de pagamento, mediante notificação extrajudicial com prazo de 10 dias.</em></p>

<p style="margin-bottom: 12px;"><strong>CLÁUSULA TERCEIRA – DA VIGÊNCIA E DEMAIS OBRIGAÇÕES:</strong></p>
<p style="margin-bottom: 12px; text-align: justify;">O termo inicial do presente contrato é o de sua assinatura, e terminará ao fim do processo.</p>
<ol style="margin-left: 24px; margin-bottom: 24px;">
<li style="margin-bottom: 8px;">Todos os recursos serão revisados para protocolo nos departamentos SEPEN-JARI-CETRAN.</li>
<li style="margin-bottom: 8px;">Caso o auto esteja em fase do SEPEN, iremos apresentar procuração e formular argumentos.</li>
<li style="margin-bottom: 8px;">Não há prazo estabelecido para julgamento dos recursos.</li>
<li style="margin-bottom: 8px;">A rescisão do contrato após o protocolo não exonera do pagamento.</li>
<li style="margin-bottom: 8px;">A venda do veículo durante o processo é de responsabilidade do Contratante.</li>
</ol>

<p style="margin-bottom: 12px;"><strong>CLÁUSULA QUARTA – DO FORO:</strong></p>
<p style="margin-bottom: 32px; text-align: justify;">As partes contratantes elegem o Foro da Comarca de Campo Grande - MS.</p>

<p style="margin-bottom: 48px; text-align: right;">{{DATA_EXTENSO}}</p>

<table style="width: 100%; margin-top: 32px;">
<tr>
<td style="text-align: center; width: 45%; padding-top: 48px; border-top: 1px solid #000;"><strong>{{NOME_CLIENTE}}</strong><br/>CONTRATANTE</td>
<td style="width: 10%;"></td>
<td style="text-align: center; width: 45%; padding-top: 48px; border-top: 1px solid #000;"><strong>{{NOME_ORGANIZACAO}}</strong><br/>CONTRATADA</td>
</tr>
</table>`
    },
    {
        id: 'modelo_02',
        nome: 'AIT + Processo Administrativo',
        descricao: 'Auto de Infração + Processo Administrativo já aberto para suspensão',
        contrato: `<h2 style="text-align: center; font-weight: bold; margin-bottom: 24px; font-size: 18px;">CONTRATO DE PRESTAÇÃO DE SERVIÇO</h2>

<p style="margin-bottom: 16px;"><strong>CONTRATANTE:</strong></p>
<p style="margin-bottom: 8px;">NOME: <strong>{{NOME_CLIENTE}}</strong></p>
<p style="margin-bottom: 8px;">CPF: {{CPF_CLIENTE}} | RG: {{RG_CLIENTE}}</p>
<p style="margin-bottom: 8px;">ENDEREÇO: {{ENDERECO_CLIENTE}}</p>
<p style="margin-bottom: 16px;">TELEFONE: {{TELEFONE_CLIENTE}} | E-MAIL: {{EMAIL_CLIENTE}}</p>

<p style="margin-bottom: 24px; text-align: justify;"><strong>CONTRATADO:</strong> {{NOME_ORGANIZACAO}}, CNPJ: {{CNPJ_ORGANIZACAO}}, com endereço em {{ENDERECO_ORGANIZACAO}}.</p>

<p style="margin-bottom: 12px;"><strong>CLÁUSULA PRIMEIRA – DAS OBRIGAÇÕES DO CONTRATADO:</strong></p>
<p style="margin-bottom: 8px;">Nº DO AUTO DE INFRAÇÃO: <strong>{{AUTO_INFRACAO}}</strong></p>
<p style="margin-bottom: 12px; text-align: justify;">Nesses autos serão discutidas as penalidades:</p>
<ul style="margin-left: 24px; margin-bottom: 24px;">
<li>Auto de Infração: <strong>MULTA</strong></li>
<li>Processo Administrativo: <strong>SUSPENSÃO</strong>, curso de reciclagem e prova</li>
</ul>

<p style="margin-bottom: 12px;"><strong>CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO(A) CONTRATANTE:</strong></p>
<p style="margin-bottom: 16px; text-align: justify;">O CONTRATANTE pagará ao CONTRATADO o valor: <strong>{{VALOR_SERVICO}}</strong></p>

<p style="margin-bottom: 8px;"><em>§ 1° - Atraso superior a 10 dias acarretará multa de 10% + juros de 1% ao mês.</em></p>
<p style="margin-bottom: 8px;"><em>§ 2° - Correção monetária pelo IGPM/FGV.</em></p>
<p style="margin-bottom: 24px;"><em>§ 3° - Em caso de execução judicial: custas + 20% de honorários advocatícios.</em></p>

<p style="margin-bottom: 12px;"><strong>CLÁUSULA TERCEIRA – DA VIGÊNCIA:</strong></p>
<p style="margin-bottom: 16px; text-align: justify;">Início: data da assinatura. Término: conclusão do processo administrativo.</p>

<p style="margin-bottom: 12px;"><strong>OBRIGAÇÕES IMPORTANTES:</strong></p>
<ol style="margin-left: 24px; margin-bottom: 24px;">
<li style="margin-bottom: 8px;">Recursos serão protocolados nos departamentos SEPEN-JARI-CETRAN.</li>
<li style="margin-bottom: 8px;">Não há prazo estabelecido para julgamento pelo órgão julgador.</li>
<li style="margin-bottom: 8px;">Rescisão após protocolo não exonera do pagamento integral.</li>
<li style="margin-bottom: 8px;">Desistência antes do protocolo: multa de R$ 500,00.</li>
<li style="margin-bottom: 8px;">Notificações são enviadas ao endereço cadastrado do condutor.</li>
</ol>

<p style="margin-bottom: 12px;"><strong>CLÁUSULA QUARTA – DO FORO:</strong></p>
<p style="margin-bottom: 32px;">Foro da Comarca de Campo Grande - MS.</p>

<p style="text-align: right; margin-bottom: 48px;">{{DATA_EXTENSO}}</p>

<table style="width: 100%; margin-top: 32px;">
<tr>
<td style="text-align: center; width: 45%; padding-top: 48px; border-top: 1px solid #000;"><strong>{{NOME_CLIENTE}}</strong><br/>CONTRATANTE</td>
<td style="width: 10%;"></td>
<td style="text-align: center; width: 45%; padding-top: 48px; border-top: 1px solid #000;"><strong>{{NOME_ORGANIZACAO}}</strong><br/>CONTRATADA</td>
</tr>
</table>`
    },
    {
        id: 'modelo_04',
        nome: 'Apenas Multa',
        descricao: 'Discussão exclusiva da penalidade de multa (sem suspensão)',
        contrato: `<h2 style="text-align: center; font-weight: bold; margin-bottom: 24px; font-size: 18px;">CONTRATO DE PRESTAÇÃO DE SERVIÇO</h2>

<p style="margin-bottom: 16px;"><strong>CONTRATANTE:</strong></p>
<p style="margin-bottom: 8px;">NOME: <strong>{{NOME_CLIENTE}}</strong></p>
<p style="margin-bottom: 8px;">CPF: {{CPF_CLIENTE}} | RG: {{RG_CLIENTE}}</p>
<p style="margin-bottom: 8px;">ENDEREÇO: {{ENDERECO_CLIENTE}}</p>
<p style="margin-bottom: 16px;">TELEFONE: {{TELEFONE_CLIENTE}} | E-MAIL: {{EMAIL_CLIENTE}}</p>

<p style="margin-bottom: 24px; text-align: justify;"><strong>CONTRATADO:</strong> {{NOME_ORGANIZACAO}}, CNPJ: {{CNPJ_ORGANIZACAO}}, endereço: {{ENDERECO_ORGANIZACAO}}.</p>

<p style="margin-bottom: 12px;"><strong>CLÁUSULA PRIMEIRA – DO OBJETO:</strong></p>
<p style="margin-bottom: 8px;">Nº do Auto de Infração: <strong>{{AUTO_INFRACAO}}</strong></p>
<p style="margin-bottom: 24px; text-align: justify;">Nesses autos será discutida <strong>APENAS a penalidade de MULTA</strong>.</p>

<p style="margin-bottom: 12px;"><strong>CLÁUSULA SEGUNDA – DOS HONORÁRIOS:</strong></p>
<p style="margin-bottom: 8px;">Valor: <strong>{{VALOR_SERVICO}}</strong></p>
<p style="margin-bottom: 16px;">Forma de Pagamento: Conforme negociação.</p>

<p style="margin-bottom: 8px;"><em>§ 1° - Atraso: multa de 10% + juros de 1% ao mês.</em></p>
<p style="margin-bottom: 24px;"><em>§ 2° - Execução judicial: custas + 20% de honorários.</em></p>

<p style="margin-bottom: 12px;"><strong>CLÁUSULA TERCEIRA – DA VIGÊNCIA:</strong></p>
<p style="margin-bottom: 16px; text-align: justify;">Início na assinatura, término na conclusão do recurso de multa.</p>

<p style="margin-bottom: 12px;"><strong>OBRIGAÇÕES:</strong></p>
<ol style="margin-left: 24px; margin-bottom: 24px;">
<li style="margin-bottom: 8px;">Recursos protocolados nos departamentos SEPEN-JARI-CETRAN.</li>
<li style="margin-bottom: 8px;">A multa ficará suspensa até o julgamento definitivo.</li>
<li style="margin-bottom: 8px;">Rescisão após protocolo não exonera do pagamento.</li>
<li style="margin-bottom: 8px;">Desistência antecipada: multa de R$ 500,00.</li>
</ol>

<p style="margin-bottom: 12px;"><strong>CLÁUSULA QUARTA – DO FORO:</strong></p>
<p style="margin-bottom: 32px;">Foro da Comarca de Campo Grande - MS.</p>

<p style="text-align: right; margin-bottom: 48px;">{{DATA_EXTENSO}}</p>

<table style="width: 100%; margin-top: 32px;">
<tr>
<td style="text-align: center; width: 45%; padding-top: 48px; border-top: 1px solid #000;"><strong>{{NOME_CLIENTE}}</strong><br/>CONTRATANTE</td>
<td style="width: 10%;"></td>
<td style="text-align: center; width: 45%; padding-top: 48px; border-top: 1px solid #000;"><strong>{{NOME_ORGANIZACAO}}</strong><br/>CONTRATADA</td>
</tr>
</table>`
    },
    {
        id: 'procuracao',
        nome: 'Procuração',
        descricao: 'Documento para representação em órgãos de trânsito',
        contrato: `<h2 style="text-align: center; font-weight: bold; margin-bottom: 32px; font-size: 18px;">PROCURAÇÃO</h2>

<p style="margin-bottom: 24px; text-align: justify;"><strong>OUTORGANTE:</strong> {{NOME_CLIENTE}}, brasileiro(a), inscrito no CPF sob o nº {{CPF_CLIENTE}}, portador(a) da carteira de identidade nº {{RG_CLIENTE}}, residente e domiciliado(a) no endereço {{ENDERECO_CLIENTE}}.</p>

<p style="margin-bottom: 24px; text-align: justify;"><strong>OUTORGADO:</strong> {{NOME_ORGANIZACAO}}, inscrita no CNPJ sob o nº {{CNPJ_ORGANIZACAO}}, com escritório localizado em {{ENDERECO_ORGANIZACAO}}.</p>

<p style="margin-bottom: 24px; text-align: justify;"><strong>PODERES:</strong> para representar o(a) outorgante perante todos os órgãos de trânsito ou entidades, sejam estaduais, municipais e autarquias, também perante todos os órgãos do Poder Judiciário, em todos assuntos de seu interesse, utilizando os poderes da cláusula "ad judicia" e os especiais dos art. 359 e 105 do CPC, podendo transigir, acordar, discordar, concordar, desistir, renunciar, firmar compromissos, assinar, ter vista de processos, receber notificações, formular requerimentos, apresentar defesas e impugnações administrativas e/ou judicialmente, apresentar recursos, solicitar retirada de impedimentos, bloqueios e restrições, como também substabelecer esta, no todo ou em parte.</p>

<p style="margin-bottom: 48px; text-align: justify;"><strong>FINALIDADE:</strong> REPRESENTAÇÃO PERANTE TODOS OS ÓRGÃOS E AUTARQUIAS DE TRÂNSITO.</p>

<p style="text-align: right; margin-bottom: 64px;">{{DATA_EXTENSO}}</p>

<div style="text-align: center; margin-top: 64px;">
<p style="border-top: 1px solid #000; display: inline-block; padding-top: 12px; min-width: 300px;"><strong>{{NOME_CLIENTE}}</strong><br/>OUTORGANTE</p>
</div>`
    },
    {
        id: 'acompanhamento_mensal',
        nome: 'Acompanhamento Mensal de Multas',
        descricao: 'Serviço de rastreamento e acompanhamento de multas mensal',
        contrato: `<h2 style="text-align: center; font-weight: bold; margin-bottom: 24px; font-size: 18px;">CONTRATO DE PRESTAÇÃO DE SERVIÇO MENSAL</h2>

<p style="margin-bottom: 16px;"><strong>CONTRATANTE:</strong></p>
<p style="margin-bottom: 8px;">NOME: <strong>{{NOME_CLIENTE}}</strong></p>
<p style="margin-bottom: 8px;">CPF: {{CPF_CLIENTE}}</p>
<p style="margin-bottom: 8px;">ENDEREÇO: {{ENDERECO_CLIENTE}}</p>
<p style="margin-bottom: 16px;">TELEFONE: {{TELEFONE_CLIENTE}} | E-MAIL: {{EMAIL_CLIENTE}}</p>

<p style="margin-bottom: 24px;"><strong>CONTRATADO:</strong> {{NOME_ORGANIZACAO}}, CNPJ: {{CNPJ_ORGANIZACAO}}</p>

<p style="margin-bottom: 12px;"><strong>OBJETO DO CONTRATO:</strong></p>
<p style="margin-bottom: 24px; text-align: justify;">Serviço de <strong>{{NOME_SERVICO}}</strong> para todos os veículos cadastrados do cliente.</p>

<p style="margin-bottom: 12px;"><strong>DESCRIÇÃO DO SERVIÇO:</strong></p>
<ul style="margin-left: 24px; margin-bottom: 24px;">
<li style="margin-bottom: 8px;">Monitoramento ativo de novas multas junto aos órgãos de trânsito</li>
<li style="margin-bottom: 8px;">Alertas automáticos sobre novas infrações</li>
<li style="margin-bottom: 8px;">Acompanhamento de prazos para recursos</li>
<li style="margin-bottom: 8px;">Consultoria sobre possibilidade de recursos</li>
</ul>

<p style="margin-bottom: 24px;"><strong>VALOR MENSAL:</strong> {{VALOR_SERVICO}}</p>

<p style="margin-bottom: 24px;"><strong>FORMA DE PAGAMENTO:</strong> Mensalidade com vencimento todo dia 10.</p>

<p style="margin-bottom: 12px;"><strong>VIGÊNCIA:</strong></p>
<p style="margin-bottom: 24px; text-align: justify;">Este contrato é por prazo indeterminado, podendo ser rescindido por qualquer das partes mediante aviso prévio de 30 dias.</p>

<p style="margin-bottom: 12px;"><strong>OBRIGAÇÕES DO CONTRATANTE:</strong></p>
<ol style="margin-left: 24px; margin-bottom: 32px;">
<li style="margin-bottom: 8px;">Manter os dados atualizados no sistema</li>
<li style="margin-bottom: 8px;">Informar eventuais mudanças nos veículos cadastrados</li>
<li style="margin-bottom: 8px;">Efetuar o pagamento da mensalidade no prazo</li>
</ol>

<p style="text-align: right; margin-bottom: 48px;">{{DATA_EXTENSO}}</p>

<table style="width: 100%; margin-top: 32px;">
<tr>
<td style="text-align: center; width: 45%; padding-top: 48px; border-top: 1px solid #000;"><strong>{{NOME_CLIENTE}}</strong><br/>CONTRATANTE</td>
<td style="width: 10%;"></td>
<td style="text-align: center; width: 45%; padding-top: 48px; border-top: 1px solid #000;"><strong>{{NOME_ORGANIZACAO}}</strong><br/>CONTRATADA</td>
</tr>
</table>`
    }
];

interface Cliente {
    nome: string;
    cpf?: string | null;
    rg?: string | null;
    endereco_completo?: string | null;
    telefone?: string | null;
    email?: string | null;
}

interface Organizacao {
    nome: string;
    cnpj?: string | null;
    nome_contrato?: string | null;
    cnpj_contrato?: string | null;
    endereco_contrato?: string | null;
    endereco_completo?: string | null;
}

interface DadosContrato {
    auto_infracao?: string;
    placa?: string;
    valor?: number;
    nome_servico?: string;
}

/**
 * Hook para gerenciar serviços com contratos modelo
 */
export function useServicosConfig() {
    const { currentOrganization } = useOrganization();
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Buscar serviços da organização
    const fetchServicos = useCallback(async () => {
        if (!currentOrganization) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('servicos')
                .select('*')
                .eq('organization_id', currentOrganization.id)
                .order('ordem', { ascending: true });

            if (fetchError) throw fetchError;
            setServicos(data || []);
        } catch (err: any) {
            console.error('[useServicosConfig] Erro ao buscar serviços:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentOrganization]);

    // Buscar serviços ativos (para seleção no cadastro)
    const fetchServicosAtivos = useCallback(async () => {
        if (!currentOrganization) return [];

        try {
            const { data, error: fetchError } = await supabase
                .from('servicos')
                .select('*')
                .eq('organization_id', currentOrganization.id)
                .eq('ativo', true)
                .order('ordem', { ascending: true });

            if (fetchError) throw fetchError;
            return data || [];
        } catch (err: any) {
            console.error('[useServicosConfig] Erro ao buscar serviços ativos:', err);
            return [];
        }
    }, [currentOrganization]);

    // Criar novo serviço
    const createServico = async (data: Omit<ServicoInsert, 'organization_id'>) => {
        if (!currentOrganization) throw new Error('Organização não encontrada');

        const { data: newServico, error: insertError } = await supabase
            .from('servicos')
            .insert({
                ...data,
                organization_id: currentOrganization.id,
            } as any)
            .select()
            .single();

        if (insertError) throw insertError;

        await fetchServicos();
        return newServico;
    };

    // Atualizar serviço
    const updateServico = async (id: string, data: ServicoUpdate) => {
        const { data: updated, error: updateError } = await supabase
            .from('servicos')
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            } as any)
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        await fetchServicos();
        return updated;
    };

    // Toggle ativo/inativo
    const toggleAtivo = async (id: string) => {
        const servico = servicos.find(s => s.id === id);
        if (!servico) return;

        await updateServico(id, { ativo: !servico.ativo });
    };

    // Excluir serviço
    const deleteServico = async (id: string) => {
        const { error: deleteError } = await supabase
            .from('servicos')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        await fetchServicos();
    };

    // Função para substituir variáveis no contrato
    const substituirVariaveis = (
        texto: string,
        cliente: Cliente,
        organizacao: Organizacao,
        dados: DadosContrato = {}
    ): string => {
        const hoje = new Date();
        const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

        const substituicoes: Record<string, string> = {
            '{{NOME_CLIENTE}}': cliente.nome || '',
            '{{CPF_CLIENTE}}': cliente.cpf || '',
            '{{RG_CLIENTE}}': cliente.rg || '',
            '{{ENDERECO_CLIENTE}}': cliente.endereco_completo || '',
            '{{TELEFONE_CLIENTE}}': cliente.telefone || '',
            '{{EMAIL_CLIENTE}}': cliente.email || '',
            '{{DATA_ATUAL}}': hoje.toLocaleDateString('pt-BR'),
            '{{DATA_EXTENSO}}': `${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`,
            '{{NOME_ORGANIZACAO}}': organizacao.nome_contrato || organizacao.nome || '',
            '{{CNPJ_ORGANIZACAO}}': organizacao.cnpj_contrato || organizacao.cnpj || '',
            '{{ENDERECO_ORGANIZACAO}}': organizacao.endereco_contrato || organizacao.endereco_completo || '',
            '{{AUTO_INFRACAO}}': dados.auto_infracao || '',
            '{{PLACA}}': dados.placa || '',
            '{{VALOR_SERVICO}}': dados.valor ? `R$ ${dados.valor.toFixed(2).replace('.', ',')}` : '',
            '{{NOME_SERVICO}}': dados.nome_servico || '',
        };

        let resultado = texto;
        for (const [variavel, valor] of Object.entries(substituicoes)) {
            resultado = resultado.replace(new RegExp(variavel.replace(/[{}]/g, '\\$&'), 'g'), valor);
        }

        return resultado;
    };

    // Gerar contrato a partir do modelo de um serviço
    const gerarContratoDoServico = (
        servico: Servico,
        cliente: Cliente,
        organizacao: Organizacao,
        dados: DadosContrato = {}
    ): string => {
        if (!servico.contrato_modelo) {
            return '';
        }

        return substituirVariaveis(
            servico.contrato_modelo,
            cliente,
            organizacao,
            { ...dados, nome_servico: servico.nome, valor: dados.valor || servico.preco_base }
        );
    };

    // Carregar serviços ao montar
    useEffect(() => {
        fetchServicos();
    }, [fetchServicos]);

    return {
        servicos,
        loading,
        error,
        fetchServicos,
        fetchServicosAtivos,
        createServico,
        updateServico,
        toggleAtivo,
        deleteServico,
        substituirVariaveis,
        gerarContratoDoServico,
    };
}

export default useServicosConfig;
