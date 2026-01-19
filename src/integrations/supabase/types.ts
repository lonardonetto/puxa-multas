export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          ativo: boolean | null
          celular: string
          cnpj: string | null
          cpf: string | null
          created_at: string | null
          crm_infracao: string | null
          crm_origem: string | null
          crm_status: Database["public"]["Enums"]["crm_status"] | null
          crm_tipo: string | null
          crm_valor: number | null
          data_nascimento: string | null
          descricao: string | null
          email: string
          endereco: Json | null
          estado_civil: string | null
          id: string
          inscricao_estadual: string | null
          nome_completo: string
          nome_fantasia: string | null
          organization_id: string | null
          profissao: string | null
          razao_social: string | null
          rg: string | null
          telefone: string | null
          tipo_pessoa: Database["public"]["Enums"]["tipo_pessoa"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          celular: string
          cnpj?: string | null
          cpf?: string | null
          created_at?: string | null
          crm_infracao?: string | null
          crm_origem?: string | null
          crm_status?: Database["public"]["Enums"]["crm_status"] | null
          crm_tipo?: string | null
          crm_valor?: number | null
          data_nascimento?: string | null
          descricao?: string | null
          email: string
          endereco?: Json | null
          estado_civil?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome_completo: string
          nome_fantasia?: string | null
          organization_id?: string | null
          profissao?: string | null
          razao_social?: string | null
          rg?: string | null
          telefone?: string | null
          tipo_pessoa?: Database["public"]["Enums"]["tipo_pessoa"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          celular?: string
          cnpj?: string | null
          cpf?: string | null
          created_at?: string | null
          crm_infracao?: string | null
          crm_origem?: string | null
          crm_status?: Database["public"]["Enums"]["crm_status"] | null
          crm_tipo?: string | null
          crm_valor?: number | null
          data_nascimento?: string | null
          descricao?: string | null
          email?: string
          endereco?: Json | null
          estado_civil?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome_completo?: string
          nome_fantasia?: string | null
          organization_id?: string | null
          profissao?: string | null
          razao_social?: string | null
          rg?: string | null
          telefone?: string | null
          tipo_pessoa?: Database["public"]["Enums"]["tipo_pessoa"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          alerta_ativo: boolean | null
          assinatura_data: Json | null
          auto_infracao: string | null
          cliente_id: string
          conteudo: string | null
          created_at: string
          data_protocolo: string | null
          data_proximo_lembrete: string | null
          data_ultima_notificacao: string | null
          fase_ait: string | null
          fase_processo: string | null
          forma_pagamento: string | null
          id: string
          intervalo_notificacao: number | null
          last_checkin_notified_at: string | null
          lembrete_ativado: boolean | null
          lido: boolean | null
          modelo_slug: string | null
          organization_id: string | null
          penalidades: string | null
          processo_administrativo: string | null
          servico_id: string | null
          status: string
          testemunhas: Json | null
          updated_at: string
          valor: number
        }
        Insert: {
          alerta_ativo?: boolean | null
          assinatura_data?: Json | null
          auto_infracao?: string | null
          cliente_id: string
          conteudo?: string | null
          created_at?: string
          data_protocolo?: string | null
          data_proximo_lembrete?: string | null
          data_ultima_notificacao?: string | null
          fase_ait?: string | null
          fase_processo?: string | null
          forma_pagamento?: string | null
          id?: string
          intervalo_notificacao?: number | null
          last_checkin_notified_at?: string | null
          lembrete_ativado?: boolean | null
          lido?: boolean | null
          modelo_slug?: string | null
          organization_id?: string | null
          penalidades?: string | null
          processo_administrativo?: string | null
          servico_id?: string | null
          status?: string
          testemunhas?: Json | null
          updated_at?: string
          valor?: number
        }
        Update: {
          alerta_ativo?: boolean | null
          assinatura_data?: Json | null
          auto_infracao?: string | null
          cliente_id?: string
          conteudo?: string | null
          created_at?: string
          data_protocolo?: string | null
          data_proximo_lembrete?: string | null
          data_ultima_notificacao?: string | null
          fase_ait?: string | null
          fase_processo?: string | null
          forma_pagamento?: string | null
          id?: string
          intervalo_notificacao?: number | null
          last_checkin_notified_at?: string | null
          lembrete_ativado?: boolean | null
          lido?: boolean | null
          modelo_slug?: string | null
          organization_id?: string | null
          penalidades?: string | null
          processo_administrativo?: string | null
          servico_id?: string | null
          status?: string
          testemunhas?: Json | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          cliente_id: string
          created_at: string | null
          id: string
          nome_arquivo: string
          tamanho_bytes: number | null
          tipo: Database["public"]["Enums"]["tipo_documento"]
          url_storage: string
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          id?: string
          nome_arquivo: string
          tamanho_bytes?: number | null
          tipo: Database["public"]["Enums"]["tipo_documento"]
          url_storage: string
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          id?: string
          nome_arquivo?: string
          tamanho_bytes?: number | null
          tipo?: Database["public"]["Enums"]["tipo_documento"]
          url_storage?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      editais: {
        Row: {
          arquivo_url: string | null
          arquivos: string[] | null
          comprado_por: string | null
          created_at: string | null
          data_publicacao: string
          descricao: string | null
          detran: string
          id: string
          nomes_vendidos: number
          prazo_recurso: string
          preco_por_nome: number
          quantidade_nomes: number
          status: string
          tipo_penalidade: string
          updated_at: string | null
        }
        Insert: {
          arquivo_url?: string | null
          arquivos?: string[] | null
          comprado_por?: string | null
          created_at?: string | null
          data_publicacao: string
          descricao?: string | null
          detran: string
          id?: string
          nomes_vendidos?: number
          prazo_recurso: string
          preco_por_nome?: number
          quantidade_nomes?: number
          status?: string
          tipo_penalidade: string
          updated_at?: string | null
        }
        Update: {
          arquivo_url?: string | null
          arquivos?: string[] | null
          comprado_por?: string | null
          created_at?: string | null
          data_publicacao?: string
          descricao?: string | null
          detran?: string
          id?: string
          nomes_vendidos?: number
          prazo_recurso?: string
          preco_por_nome?: number
          quantidade_nomes?: number
          status?: string
          tipo_penalidade?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      editais_backup: {
        Row: {
          arquivo_url: string | null
          created_at: string | null
          data_publicacao: string | null
          descricao: string | null
          detran: string | null
          id: string | null
          nomes_vendidos: number | null
          prazo_recurso: string | null
          preco_por_nome: number | null
          quantidade_nomes: number | null
          status: string | null
          tipo_penalidade: string | null
          updated_at: string | null
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string | null
          data_publicacao?: string | null
          descricao?: string | null
          detran?: string | null
          id?: string | null
          nomes_vendidos?: number | null
          prazo_recurso?: string | null
          preco_por_nome?: number | null
          quantidade_nomes?: number | null
          status?: string | null
          tipo_penalidade?: string | null
          updated_at?: string | null
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string | null
          data_publicacao?: string | null
          descricao?: string | null
          detran?: string | null
          id?: string | null
          nomes_vendidos?: number | null
          prazo_recurso?: string | null
          preco_por_nome?: number | null
          quantidade_nomes?: number | null
          status?: string | null
          tipo_penalidade?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      edital_compras: {
        Row: {
          created_at: string | null
          edital_id: string
          id: string
          organization_id: string
          preco_unitario: number
          quantidade_nomes: number
          status: string
          valor_total: number
        }
        Insert: {
          created_at?: string | null
          edital_id: string
          id?: string
          organization_id: string
          preco_unitario: number
          quantidade_nomes: number
          status?: string
          valor_total: number
        }
        Update: {
          created_at?: string | null
          edital_id?: string
          id?: string
          organization_id?: string
          preco_unitario?: number
          quantidade_nomes?: number
          status?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "edital_compras_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fases_custom: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          organization_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          organization_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fases_custom_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      faturamento: {
        Row: {
          created_at: string | null
          data_expiracao: string | null
          data_pagamento: string | null
          data_vencimento: string | null
          descricao: string | null
          id: string
          is_bonus: boolean | null
          metodo_pagamento: Database["public"]["Enums"]["payment_method"] | null
          organization_id: string
          status: Database["public"]["Enums"]["billing_status"] | null
          tipo: Database["public"]["Enums"]["billing_type"]
          updated_at: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          data_expiracao?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          is_bonus?: boolean | null
          metodo_pagamento?:
            | Database["public"]["Enums"]["payment_method"]
            | null
          organization_id: string
          status?: Database["public"]["Enums"]["billing_status"] | null
          tipo: Database["public"]["Enums"]["billing_type"]
          updated_at?: string | null
          valor: number
        }
        Update: {
          created_at?: string | null
          data_expiracao?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          is_bonus?: boolean | null
          metodo_pagamento?:
            | Database["public"]["Enums"]["payment_method"]
            | null
          organization_id?: string
          status?: Database["public"]["Enums"]["billing_status"] | null
          tipo?: Database["public"]["Enums"]["billing_type"]
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "faturamento_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_atividades: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          descricao: string
          id: string
          metadata: Json | null
          organization_id: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          descricao: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          descricao?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_atividades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_atividades_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      multas: {
        Row: {
          codigo_infracao: string
          created_at: string | null
          data_multa: string
          data_vencimento: string | null
          descricao: string
          id: string
          local: string | null
          numero_auto: string | null
          orgao_autuador: string | null
          pontos: number
          status: Database["public"]["Enums"]["status_multa"] | null
          updated_at: string | null
          valor: number
          veiculo_id: string
        }
        Insert: {
          codigo_infracao: string
          created_at?: string | null
          data_multa: string
          data_vencimento?: string | null
          descricao: string
          id?: string
          local?: string | null
          numero_auto?: string | null
          orgao_autuador?: string | null
          pontos?: number
          status?: Database["public"]["Enums"]["status_multa"] | null
          updated_at?: string | null
          valor: number
          veiculo_id: string
        }
        Update: {
          codigo_infracao?: string
          created_at?: string | null
          data_multa?: string
          data_vencimento?: string | null
          descricao?: string
          id?: string
          local?: string | null
          numero_auto?: string | null
          orgao_autuador?: string | null
          pontos?: number
          status?: Database["public"]["Enums"]["status_multa"] | null
          updated_at?: string | null
          valor?: number
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "multas_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          acesso_crm: boolean | null
          acesso_disparador: boolean | null
          ativo: boolean | null
          cabecalho_texto: string | null
          cnpj: string | null
          cnpj_contrato: string | null
          cor_primaria: string | null
          cor_secundaria: string | null
          cpf: string | null
          created_at: string | null
          data_expiracao: string | null
          email: string | null
          endereco_completo: string | null
          endereco_contrato: string | null
          estilo_cabecalho: string | null
          id: string
          intervalo_notificacao: number | null
          limite_clientes: number | null
          limite_usuarios: number | null
          logo_contrato_url: string | null
          logo_url: string | null
          nome: string
          nome_contrato: string | null
          plano: string | null
          rodape_texto: string | null
          saldo_bonus: number | null
          saldo_sacavel: number | null
          site_url: string | null
          telefone: string | null
          timbre_contrato_url: string | null
          updated_at: string | null
        }
        Insert: {
          acesso_crm?: boolean | null
          acesso_disparador?: boolean | null
          ativo?: boolean | null
          cabecalho_texto?: string | null
          cnpj?: string | null
          cnpj_contrato?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          cpf?: string | null
          created_at?: string | null
          data_expiracao?: string | null
          email?: string | null
          endereco_completo?: string | null
          endereco_contrato?: string | null
          estilo_cabecalho?: string | null
          id?: string
          intervalo_notificacao?: number | null
          limite_clientes?: number | null
          limite_usuarios?: number | null
          logo_contrato_url?: string | null
          logo_url?: string | null
          nome: string
          nome_contrato?: string | null
          plano?: string | null
          rodape_texto?: string | null
          saldo_bonus?: number | null
          saldo_sacavel?: number | null
          site_url?: string | null
          telefone?: string | null
          timbre_contrato_url?: string | null
          updated_at?: string | null
        }
        Update: {
          acesso_crm?: boolean | null
          acesso_disparador?: boolean | null
          ativo?: boolean | null
          cabecalho_texto?: string | null
          cnpj?: string | null
          cnpj_contrato?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          cpf?: string | null
          created_at?: string | null
          data_expiracao?: string | null
          email?: string | null
          endereco_completo?: string | null
          endereco_contrato?: string | null
          estilo_cabecalho?: string | null
          id?: string
          intervalo_notificacao?: number | null
          limite_clientes?: number | null
          limite_usuarios?: number | null
          logo_contrato_url?: string | null
          logo_url?: string | null
          nome?: string
          nome_contrato?: string | null
          plano?: string | null
          rodape_texto?: string | null
          saldo_bonus?: number | null
          saldo_sacavel?: number | null
          site_url?: string | null
          telefone?: string | null
          timbre_contrato_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      planos: {
        Row: {
          acesso_crm: boolean | null
          acesso_disparador: boolean | null
          acesso_institucional: boolean | null
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          limite_clientes: number | null
          limite_usuarios: number
          marketing_digital: string | null
          modulo_educacional: string | null
          nome: string
          preco_edital: number | null
          preco_mensal: number
          preco_rastreamento: number | null
          preco_recurso_ia: number | null
          rastreamento_frota_preco: number | null
          rastreamento_garantido_preco: number | null
          rastreamento_pf_preco: number | null
          recursos: Json | null
          recursos_ia_inclusos: number | null
          recursos_ia_suspensao_inclusos: number | null
          recursos_ia_suspensao_preco_adicional: number | null
          slug: string
          suporte: string | null
          updated_at: string | null
        }
        Insert: {
          acesso_crm?: boolean | null
          acesso_disparador?: boolean | null
          acesso_institucional?: boolean | null
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          limite_clientes?: number | null
          limite_usuarios?: number
          marketing_digital?: string | null
          modulo_educacional?: string | null
          nome: string
          preco_edital?: number | null
          preco_mensal?: number
          preco_rastreamento?: number | null
          preco_recurso_ia?: number | null
          rastreamento_frota_preco?: number | null
          rastreamento_garantido_preco?: number | null
          rastreamento_pf_preco?: number | null
          recursos?: Json | null
          recursos_ia_inclusos?: number | null
          recursos_ia_suspensao_inclusos?: number | null
          recursos_ia_suspensao_preco_adicional?: number | null
          slug: string
          suporte?: string | null
          updated_at?: string | null
        }
        Update: {
          acesso_crm?: boolean | null
          acesso_disparador?: boolean | null
          acesso_institucional?: boolean | null
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          limite_clientes?: number | null
          limite_usuarios?: number
          marketing_digital?: string | null
          modulo_educacional?: string | null
          nome?: string
          preco_edital?: number | null
          preco_mensal?: number
          preco_rastreamento?: number | null
          preco_recurso_ia?: number | null
          rastreamento_frota_preco?: number | null
          rastreamento_garantido_preco?: number | null
          rastreamento_pf_preco?: number | null
          recursos?: Json | null
          recursos_ia_inclusos?: number | null
          recursos_ia_suspensao_inclusos?: number | null
          recursos_ia_suspensao_preco_adicional?: number | null
          slug?: string
          suporte?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rastreamento_cobrancas: {
        Row: {
          created_at: string | null
          custo_plataforma: number | null
          id: string
          mes_referencia: string
          organization_id: string | null
          status: string | null
          valor: number
          veiculo_id: string | null
        }
        Insert: {
          created_at?: string | null
          custo_plataforma?: number | null
          id?: string
          mes_referencia: string
          organization_id?: string | null
          status?: string | null
          valor: number
          veiculo_id?: string | null
        }
        Update: {
          created_at?: string | null
          custo_plataforma?: number | null
          id?: string
          mes_referencia?: string
          organization_id?: string | null
          status?: string | null
          valor?: number
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rastreamento_cobrancas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rastreamento_cobrancas_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      recursos: {
        Row: {
          conteudo: string | null
          created_at: string | null
          data_protocolo: string | null
          data_ultima_notificacao: string | null
          id: string
          instancia: Database["public"]["Enums"]["instancia_recurso"]
          is_ia: boolean | null
          multa_id: string
          numero_protocolo: string | null
          observacoes: string | null
          organization_id: string | null
          status: Database["public"]["Enums"]["status_recurso"] | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string | null
          data_protocolo?: string | null
          data_ultima_notificacao?: string | null
          id?: string
          instancia: Database["public"]["Enums"]["instancia_recurso"]
          is_ia?: boolean | null
          multa_id: string
          numero_protocolo?: string | null
          observacoes?: string | null
          organization_id?: string | null
          status?: Database["public"]["Enums"]["status_recurso"] | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string | null
          data_protocolo?: string | null
          data_ultima_notificacao?: string | null
          id?: string
          instancia?: Database["public"]["Enums"]["instancia_recurso"]
          is_ia?: boolean | null
          multa_id?: string
          numero_protocolo?: string | null
          observacoes?: string | null
          organization_id?: string | null
          status?: Database["public"]["Enums"]["status_recurso"] | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recursos_multa_id_fkey"
            columns: ["multa_id"]
            isOneToOne: false
            referencedRelation: "multas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recursos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean
          campos_dinamicos: Json | null
          contrato_modelo: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
          organization_id: string
          preco_base: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          campos_dinamicos?: Json | null
          contrato_modelo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
          organization_id: string
          preco_base?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          campos_dinamicos?: Json | null
          contrato_modelo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          organization_id?: string
          preco_base?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organizations: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          nome: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          nome?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      veiculos: {
        Row: {
          ano: string
          ativo: boolean | null
          cliente_id: string
          created_at: string | null
          id: string
          modelo: string
          placa: string
          rastreamento_ativo: boolean | null
          rastreamento_inicio: string | null
          rastreamento_valor: number | null
          renavam: string | null
          updated_at: string | null
        }
        Insert: {
          ano: string
          ativo?: boolean | null
          cliente_id: string
          created_at?: string | null
          id?: string
          modelo: string
          placa: string
          rastreamento_ativo?: boolean | null
          rastreamento_inicio?: string | null
          rastreamento_valor?: number | null
          renavam?: string | null
          updated_at?: string | null
        }
        Update: {
          ano?: string
          ativo?: boolean | null
          cliente_id?: string
          created_at?: string | null
          id?: string
          modelo?: string
          placa?: string
          rastreamento_ativo?: boolean | null
          rastreamento_inicio?: string | null
          rastreamento_valor?: number | null
          renavam?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_is_org_admin: { Args: { org_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      billing_status: "pending" | "paid" | "overdue" | "cancelled"
      billing_type:
        | "subscription"
        | "credit_purchase"
        | "system_usage"
        | "adjustment"
      crm_status: "novo" | "negociacao" | "followup" | "fechado" | "perdido"
      instancia_recurso: "defesa_previa" | "jari" | "cetran"
      organization_plan:
        | "free"
        | "basic"
        | "premium"
        | "enterprise"
        | "gratuito"
        | "intermediario"
        | "top"
      payment_method: "boleto" | "credit_card" | "pix" | "balance"
      status_multa: "pendente" | "suspensiva" | "analise" | "concluido" | "pago"
      status_recurso:
        | "rascunho"
        | "protocolado"
        | "aguardando_julgamento"
        | "deferido"
        | "indeferido"
      tipo_documento:
        | "identidade"
        | "comprovante_residencia"
        | "cnh"
        | "crlv"
        | "procuracao"
        | "contrato"
        | "outro"
      tipo_pessoa: "fisica" | "juridica"
      user_role: "super_admin" | "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      billing_status: ["pending", "paid", "overdue", "cancelled"],
      billing_type: [
        "subscription",
        "credit_purchase",
        "system_usage",
        "adjustment",
      ],
      crm_status: ["novo", "negociacao", "followup", "fechado", "perdido"],
      instancia_recurso: ["defesa_previa", "jari", "cetran"],
      organization_plan: [
        "free",
        "basic",
        "premium",
        "enterprise",
        "gratuito",
        "intermediario",
        "top",
      ],
      payment_method: ["boleto", "credit_card", "pix", "balance"],
      status_multa: ["pendente", "suspensiva", "analise", "concluido", "pago"],
      status_recurso: [
        "rascunho",
        "protocolado",
        "aguardando_julgamento",
        "deferido",
        "indeferido",
      ],
      tipo_documento: [
        "identidade",
        "comprovante_residencia",
        "cnh",
        "crlv",
        "procuracao",
        "contrato",
        "outro",
      ],
      tipo_pessoa: ["fisica", "juridica"],
      user_role: ["super_admin", "admin", "user"],
    },
  },
} as const
