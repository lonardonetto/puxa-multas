// Types for Supabase Database
// These types match the database schema

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

// Endereco type for JSON field
export interface Endereco {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
}

// Status types
export type UserRole = 'super_admin' | 'admin' | 'user';
export type OrganizationPlan = 'free' | 'basic' | 'premium' | 'enterprise' | 'gratuito' | 'intermediario' | 'top';
export type TipoPessoa = 'fisica' | 'juridica';
export type StatusMulta = 'pendente' | 'suspensiva' | 'analise' | 'concluido' | 'pago';
export type StatusRecurso = 'rascunho' | 'protocolado' | 'aguardando_julgamento' | 'deferido' | 'indeferido';
export type InstanciaRecurso = 'defesa_previa' | 'jari' | 'cetran';
export type TipoDocumento = 'identidade' | 'comprovante_residencia' | 'cnh' | 'crlv' | 'procuracao' | 'contrato' | 'outro';
export type CRMStatus = 'novo' | 'negociacao' | 'followup' | 'fechado' | 'perdido';
export type BillingType = 'subscription' | 'credit_purchase' | 'system_usage' | 'adjustment';
export type BillingStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'boleto' | 'credit_card' | 'pix' | 'balance';

export interface Database {
    public: {
        Tables: {
            organizations: {
                Row: {
                    id: string;
                    nome: string;
                    cnpj: string | null;
                    cpf: string | null;
                    email: string | null;
                    telefone: string | null;
                    plano: OrganizationPlan;
                    ativo: boolean;
                    limite_usuarios: number;
                    limite_clientes: number;
                    saldo_sacavel: number;
                    saldo_bonus: number;
                    data_expiracao: string | null;
                    logo_url: string | null;
                    cor_primaria: string | null;
                    cor_secundaria: string | null;
                    estilo_cabecalho: 'elegant' | 'classic' | 'minimal' | null;
                    logo_contrato_url: string | null;
                    timbre_contrato_url: string | null;
                    nome_contrato: string | null;
                    cnpj_contrato: string | null;
                    endereco_contrato: string | null;
                    cabecalho_texto: string | null;
                    rodape_texto: string | null;
                    endereco_completo: string | null;
                    site_url: string | null;
                    intervalo_notificacao: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    nome: string;
                    cnpj?: string | null;
                    cpf?: string | null;
                    email?: string | null;
                    telefone?: string | null;
                    plano?: OrganizationPlan;
                    ativo?: boolean;
                    limite_usuarios?: number;
                    limite_clientes?: number;
                    saldo_sacavel?: number;
                    saldo_bonus?: number;
                    data_expiracao?: string | null;
                    logo_url?: string | null;
                    cor_primaria?: string | null;
                    cor_secundaria?: string | null;
                    estilo_cabecalho?: 'elegant' | 'classic' | 'minimal' | null;
                    cabecalho_texto?: string | null;
                    rodape_texto?: string | null;
                    endereco_completo?: string | null;
                    site_url?: string | null;
                    intervalo_notificacao?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    nome?: string;
                    cnpj?: string | null;
                    cpf?: string | null;
                    email?: string | null;
                    telefone?: string | null;
                    plano?: OrganizationPlan;
                    ativo?: boolean;
                    limite_usuarios?: number;
                    limite_clientes?: number;
                    saldo_sacavel?: number;
                    saldo_bonus?: number;
                    data_expiracao?: string | null;
                    logo_url?: string | null;
                    cor_primaria?: string | null;
                    cor_secundaria?: string | null;
                    estilo_cabecalho?: 'elegant' | 'classic' | 'minimal' | null;
                    cabecalho_texto?: string | null;
                    rodape_texto?: string | null;
                    endereco_completo?: string | null;
                    site_url?: string | null;
                    intervalo_notificacao?: number;
                    updated_at?: string;
                };
            };
            user_organizations: {
                Row: {
                    id: string;
                    user_id: string;
                    organization_id: string;
                    role: UserRole;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    organization_id: string;
                    role?: UserRole;
                    created_at?: string;
                };
                Update: {
                    role?: UserRole;
                };
            };
            users: {
                Row: {
                    id: string;
                    email: string;
                    nome: string | null;
                    telefone: string | null;
                    role: UserRole;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    nome?: string | null;
                    telefone?: string | null;
                    role?: UserRole;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    nome?: string | null;
                    telefone?: string | null;
                    role?: UserRole;
                    updated_at?: string;
                };
            };
            clientes: {
                Row: {
                    id: string;
                    user_id: string;
                    organization_id: string | null;
                    tipo_pessoa: TipoPessoa;
                    nome_completo: string;
                    razao_social: string | null;
                    nome_fantasia: string | null;
                    cpf: string | null;
                    cnpj: string | null;
                    rg: string | null;
                    inscricao_estadual: string | null;
                    data_nascimento: string | null;
                    estado_civil: string | null;
                    profissao: string | null;
                    email: string;
                    telefone: string | null;
                    celular: string;
                    endereco: Endereco | null;
                    ativo: boolean;
                    crm_status: CRMStatus;
                    crm_valor: number;
                    crm_origem: string | null;
                    crm_tipo: string | null;
                    crm_infracao: string | null;
                    descricao: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    organization_id?: string | null;
                    tipo_pessoa: TipoPessoa;
                    nome_completo: string;
                    razao_social?: string | null;
                    nome_fantasia?: string | null;
                    cpf?: string | null;
                    cnpj?: string | null;
                    rg?: string | null;
                    inscricao_estadual?: string | null;
                    data_nascimento?: string | null;
                    estado_civil?: string | null;
                    profissao?: string | null;
                    email: string;
                    telefone?: string | null;
                    celular: string;
                    endereco?: Endereco | null;
                    ativo?: boolean;
                    crm_status?: CRMStatus;
                    crm_valor?: number;
                    crm_origem?: string | null;
                    crm_tipo?: string | null;
                    crm_infracao?: string | null;
                    descricao?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    tipo_pessoa?: TipoPessoa;
                    nome_completo?: string;
                    razao_social?: string | null;
                    nome_fantasia?: string | null;
                    cpf?: string | null;
                    cnpj?: string | null;
                    rg?: string | null;
                    inscricao_estadual?: string | null;
                    data_nascimento?: string | null;
                    estado_civil?: string | null;
                    profissao?: string | null;
                    email?: string;
                    telefone?: string | null;
                    celular?: string;
                    endereco?: Endereco | null;
                    ativo?: boolean;
                    crm_status?: CRMStatus;
                    crm_valor?: number;
                    crm_origem?: string | null;
                    crm_tipo?: string | null;
                    crm_infracao?: string | null;
                    descricao?: string | null;
                    updated_at?: string;
                };
            };
            veiculos: {
                Row: {
                    id: string;
                    cliente_id: string;
                    placa: string;
                    modelo: string;
                    ano: string;
                    renavam: string | null;
                    ativo: boolean;
                    rastreamento_ativo: boolean;
                    rastreamento_inicio: string | null;
                    rastreamento_valor: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    cliente_id: string;
                    placa: string;
                    modelo: string;
                    ano: string;
                    renavam?: string | null;
                    ativo?: boolean;
                    rastreamento_ativo?: boolean;
                    rastreamento_inicio?: string | null;
                    rastreamento_valor?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    placa?: string;
                    modelo?: string;
                    ano?: string;
                    renavam?: string | null;
                    ativo?: boolean;
                    rastreamento_ativo?: boolean;
                    rastreamento_inicio?: string | null;
                    rastreamento_valor?: number;
                    updated_at?: string;
                };
            };
            multas: {
                Row: {
                    id: string;
                    veiculo_id: string;
                    codigo_infracao: string;
                    descricao: string;
                    status: StatusMulta;
                    valor: number;
                    pontos: number;
                    data_multa: string;
                    data_vencimento: string | null;
                    local: string | null;
                    orgao_autuador: string | null;
                    numero_auto: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    veiculo_id: string;
                    codigo_infracao: string;
                    descricao: string;
                    status?: StatusMulta;
                    valor: number;
                    pontos: number;
                    data_multa: string;
                    data_vencimento?: string | null;
                    local?: string | null;
                    orgao_autuador?: string | null;
                    numero_auto?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    codigo_infracao?: string;
                    descricao?: string;
                    status?: StatusMulta;
                    valor?: number;
                    pontos?: number;
                    data_multa?: string;
                    data_vencimento?: string | null;
                    local?: string | null;
                    orgao_autuador?: string | null;
                    numero_auto?: string | null;
                    updated_at?: string;
                };
            };
            recursos: {
                Row: {
                    id: string;
                    multa_id: string;
                    tipo: string;
                    status: StatusRecurso;
                    instancia: InstanciaRecurso;
                    data_protocolo: string | null;
                    data_ultima_notificacao: string | null;
                    numero_protocolo: string | null;
                    observacoes: string | null;
                    conteudo: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    multa_id: string;
                    tipo: string;
                    status?: StatusRecurso;
                    instancia: InstanciaRecurso;
                    data_protocolo?: string | null;
                    data_ultima_notificacao?: string | null;
                    numero_protocolo?: string | null;
                    observacoes?: string | null;
                    conteudo?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    tipo?: string;
                    status?: StatusRecurso;
                    instancia?: InstanciaRecurso;
                    data_protocolo?: string | null;
                    data_ultima_notificacao?: string | null;
                    numero_protocolo?: string | null;
                    observacoes?: string | null;
                    conteudo?: string | null;
                    updated_at?: string;
                };
            };
            documentos: {
                Row: {
                    id: string;
                    cliente_id: string;
                    tipo: TipoDocumento;
                    nome_arquivo: string;
                    url_storage: string;
                    tamanho_bytes: number | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    cliente_id: string;
                    tipo: TipoDocumento;
                    nome_arquivo: string;
                    url_storage: string;
                    tamanho_bytes?: number | null;
                    created_at?: string;
                };
                Update: {
                    tipo?: TipoDocumento;
                    nome_arquivo?: string;
                    url_storage?: string;
                    tamanho_bytes?: number | null;
                };
            };
            faturamento: {
                Row: {
                    id: string;
                    organization_id: string;
                    tipo: BillingType;
                    valor: number;
                    status: BillingStatus;
                    metodo_pagamento: PaymentMethod | null;
                    descricao: string | null;
                    categoria: string | null;
                    is_bonus: boolean;
                    data_expiracao: string | null;
                    data_vencimento: string | null;
                    data_pagamento: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    organization_id: string;
                    tipo: BillingType;
                    valor: number;
                    status?: BillingStatus;
                    metodo_pagamento?: PaymentMethod | null;
                    descricao?: string | null;
                    categoria?: string | null;
                    is_bonus?: boolean;
                    data_expiracao?: string | null;
                    data_vencimento?: string | null;
                    data_pagamento?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    tipo?: BillingType;
                    valor?: number;
                    status?: BillingStatus;
                    metodo_pagamento?: PaymentMethod | null;
                    descricao?: string | null;
                    categoria?: string | null;
                    is_bonus?: boolean;
                    data_vencimento?: string | null;
                    data_pagamento?: string | null;
                    updated_at?: string;
                };
            };
            servicos: {
                Row: {
                    id: string;
                    organization_id: string;
                    nome: string;
                    descricao: string | null;
                    preco_base: number;
                    ativo: boolean;
                    contrato_modelo: string | null;
                    campos_dinamicos: string[] | null;
                    ordem: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    organization_id: string;
                    nome: string;
                    descricao?: string | null;
                    preco_base?: number;
                    ativo?: boolean;
                    contrato_modelo?: string | null;
                    campos_dinamicos?: string[] | null;
                    ordem?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    nome?: string;
                    descricao?: string | null;
                    preco_base?: number;
                    ativo?: boolean;
                    contrato_modelo?: string | null;
                    campos_dinamicos?: string[] | null;
                    ordem?: number;
                    updated_at?: string;
                };
            };
            contratos: {
                Row: {
                    id: string;
                    cliente_id: string;
                    servico_id: string | null;
                    organization_id: string;
                    status: 'pendente' | 'assinado' | 'cancelado' | 'deferido' | 'indeferido' | 'aguardando_julgamento';
                    valor: number;
                    conteudo: string | null;
                    assinatura_data: Json | null;
                    auto_infracao: string | null;
                    penalidades: string | null;
                    forma_pagamento: string | null;
                    modelo_slug: string | null;
                    processo_administrativo: string | null;
                    fase_ait: 'SEPEN' | 'JARI' | 'CETRAN' | null;
                    fase_processo: 'SEPEN' | 'JARI' | 'CETRAN' | null;
                    testemunhas: Json | null;
                    data_ultima_notificacao: string | null;
                    data_protocolo: string | null;
                    intervalo_notificacao: number | null;
                    lembrete_ativado: boolean | null;
                    data_proximo_lembrete: string | null;
                    alerta_ativo: boolean | null;
                    lido: boolean | null;
                    last_checkin_notified_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    cliente_id: string;
                    servico_id?: string | null;
                    organization_id: string;
                    status?: 'pendente' | 'assinado' | 'cancelado' | 'deferido' | 'indeferido' | 'aguardando_julgamento';
                    valor: number;
                    conteudo?: string | null;
                    assinatura_data?: Json | null;
                    auto_infracao?: string | null;
                    penalidades?: string | null;
                    forma_pagamento?: string | null;
                    modelo_slug?: string | null;
                    processo_administrativo?: string | null;
                    fase_ait?: 'SEPEN' | 'JARI' | 'CETRAN' | null;
                    fase_processo?: 'SEPEN' | 'JARI' | 'CETRAN' | null;
                    testemunhas?: Json | null;
                    data_ultima_notificacao?: string | null;
                    data_protocolo?: string | null;
                    intervalo_notificacao?: number | null;
                    lembrete_ativado?: boolean | null;
                    data_proximo_lembrete?: string | null;
                    alerta_ativo?: boolean | null;
                    lido?: boolean | null;
                    last_checkin_notified_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    status?: 'pendente' | 'assinado' | 'cancelado' | 'deferido' | 'indeferido' | 'aguardando_julgamento';
                    valor?: number;
                    conteudo?: string | null;
                    assinatura_data?: Json | null;
                    auto_infracao?: string | null;
                    penalidades?: string | null;
                    forma_pagamento?: string | null;
                    modelo_slug?: string | null;
                    processo_administrativo?: string | null;
                    fase_ait?: 'SEPEN' | 'JARI' | 'CETRAN' | null;
                    fase_processo?: 'SEPEN' | 'JARI' | 'CETRAN' | null;
                    testemunhas?: Json | null;
                    data_ultima_notificacao?: string | null;
                    data_protocolo?: string | null;
                    intervalo_notificacao?: number | null;
                    lembrete_ativado?: boolean | null;
                    data_proximo_lembrete?: string | null;
                    alerta_ativo?: boolean | null;
                    lido?: boolean | null;
                    last_checkin_notified_at?: string | null;
                    updated_at?: string;
                };
            };
            historico_atividades: {
                Row: {
                    id: string;
                    cliente_id: string;
                    organization_id: string;
                    tipo: 'cadastro' | 'contrato_criado' | 'contrato_assinado' | 'documento_enviado' | 'cliente_editado' | 'status_alterado' | 'manual';
                    descricao: string;
                    metadata: Json | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    cliente_id: string;
                    organization_id: string;
                    tipo: 'cadastro' | 'contrato_criado' | 'contrato_assinado' | 'documento_enviado' | 'cliente_editado' | 'status_alterado' | 'manual';
                    descricao: string;
                    metadata?: Json | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    tipo?: 'cadastro' | 'contrato_criado' | 'contrato_assinado' | 'documento_enviado' | 'cliente_editado' | 'status_alterado' | 'manual';
                    descricao?: string;
                    metadata?: Json | null;
                    updated_at?: string;
                };
            };
            fases_custom: {
                Row: {
                    id: string;
                    organization_id: string;
                    nome: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    organization_id: string;
                    nome: string;
                    created_at?: string;
                };
                Update: {
                    nome?: string;
                };
            };
            planos: {
                Row: {
                    id: string;
                    nome: string;
                    slug: string;
                    descricao: string | null;
                    preco_mensal: number;
                    limite_usuarios: number;
                    limite_clientes: number;
                    recursos: Json | null;
                    ativo: boolean;
                    preco_recurso_ia: number;
                    preco_rastreamento: number;
                    preco_edital: number;
                    recursos_ia_inclusos: number;
                    acesso_crm: boolean;
                    acesso_disparador: boolean;
                    modulo_educacional: string;
                    recursos_ia_suspensao_inclusos: number;
                    recursos_ia_suspensao_preco_adicional: number;
                    marketing_digital: string | null;
                    suporte: string;
                    acesso_institucional: boolean;
                    rastreamento_pf_preco: number;
                    rastreamento_frota_preco: number;
                    rastreamento_garantido_preco: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    nome: string;
                    slug: string;
                    descricao?: string | null;
                    preco_mensal?: number;
                    limite_usuarios?: number;
                    limite_clientes?: number;
                    recursos?: Json | null;
                    ativo?: boolean;
                    preco_recurso_ia?: number;
                    preco_rastreamento?: number;
                    preco_edital?: number;
                    recursos_ia_inclusos?: number;
                    acesso_crm?: boolean;
                    acesso_disparador?: boolean;
                    modulo_educacional?: string;
                    recursos_ia_suspensao_inclusos?: number;
                    recursos_ia_suspensao_preco_adicional?: number;
                    marketing_digital?: string | null;
                    suporte?: string;
                    acesso_institucional?: boolean;
                    rastreamento_pf_preco?: number;
                    rastreamento_frota_preco?: number;
                    rastreamento_garantido_preco?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    nome?: string;
                    slug?: string;
                    descricao?: string | null;
                    preco_mensal?: number;
                    limite_usuarios?: number;
                    limite_clientes?: number;
                    recursos?: Json | null;
                    ativo?: boolean;
                    preco_recurso_ia?: number;
                    preco_rastreamento?: number;
                    preco_edital?: number;
                    recursos_ia_inclusos?: number;
                    acesso_crm?: boolean;
                    acesso_disparador?: boolean;
                    modulo_educacional?: string;
                    recursos_ia_suspensao_inclusos?: number;
                    recursos_ia_suspensao_preco_adicional?: number;
                    marketing_digital?: string | null;
                    suporte?: string;
                    acesso_institucional?: boolean;
                    rastreamento_pf_preco?: number;
                    rastreamento_frota_preco?: number;
                    rastreamento_garantido_preco?: number;
                    updated_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            tipo_pessoa: TipoPessoa;
            status_multa: StatusMulta;
            status_recurso: StatusRecurso;
            instancia_recurso: InstanciaRecurso;
            tipo_documento: TipoDocumento;
        };
    };
}

// Helper types for easier usage
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type UserOrganization = Database['public']['Tables']['user_organizations']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Cliente = Database['public']['Tables']['clientes']['Row'];
export type Veiculo = Database['public']['Tables']['veiculos']['Row'];
export type Multa = Database['public']['Tables']['multas']['Row'];
export type Recurso = Database['public']['Tables']['recursos']['Row'];
export type Documento = Database['public']['Tables']['documentos']['Row'];
export type Faturamento = Database['public']['Tables']['faturamento']['Row'];
export type Plano = Database['public']['Tables']['planos']['Row'];
export type Servico = Database['public']['Tables']['servicos']['Row'];
export type Contrato = Database['public']['Tables']['contratos']['Row'];

// Insert types
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];
export type UserOrganizationInsert = Database['public']['Tables']['user_organizations']['Insert'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type ClienteInsert = Database['public']['Tables']['clientes']['Insert'];
export type VeiculoInsert = Database['public']['Tables']['veiculos']['Insert'];
export type MultaInsert = Database['public']['Tables']['multas']['Insert'];
export type RecursoInsert = Database['public']['Tables']['recursos']['Insert'];
export type DocumentoInsert = Database['public']['Tables']['documentos']['Insert'];
export type FaturamentoInsert = Database['public']['Tables']['faturamento']['Insert'];
export type PlanoInsert = Database['public']['Tables']['planos']['Insert'];
export type ServicoInsert = Database['public']['Tables']['servicos']['Insert'];
export type ContratoInsert = Database['public']['Tables']['contratos']['Insert'];

// Update types
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];
export type UserOrganizationUpdate = Database['public']['Tables']['user_organizations']['Update'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type ClienteUpdate = Database['public']['Tables']['clientes']['Update'];
export type VeiculoUpdate = Database['public']['Tables']['veiculos']['Update'];
export type MultaUpdate = Database['public']['Tables']['multas']['Update'];
export type RecursoUpdate = Database['public']['Tables']['recursos']['Update'];
export type DocumentoUpdate = Database['public']['Tables']['documentos']['Update'];
export type FaturamentoUpdate = Database['public']['Tables']['faturamento']['Update'];
export type PlanoUpdate = Database['public']['Tables']['planos']['Update'];
export type ServicoUpdate = Database['public']['Tables']['servicos']['Update'];
export type ContratoUpdate = Database['public']['Tables']['contratos']['Update'];
