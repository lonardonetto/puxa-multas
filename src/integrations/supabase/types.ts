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
          celular: string | null
          cnpj: string | null
          cpf: string | null
          created_at: string | null
          crm_infracao: boolean | null
          crm_origem: string | null
          crm_status: string | null
          crm_tipo: string | null
          crm_valor: number | null
          data_nascimento: string | null
          descricao: string | null
          email: string | null
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
          tipo_pessoa: Database["public"]["Enums"]["tipo_pessoa"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          celular?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string | null
          crm_infracao?: boolean | null
          crm_origem?: string | null
          crm_status?: string | null
          crm_tipo?: string | null
          crm_valor?: number | null
          data_nascimento?: string | null
          descricao?: string | null
          email?: string | null
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
          tipo_pessoa?: Database["public"]["Enums"]["tipo_pessoa"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          celular?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string | null
          crm_infracao?: boolean | null
          crm_origem?: string | null
          crm_status?: string | null
          crm_tipo?: string | null
          crm_valor?: number | null
          data_nascimento?: string | null
          descricao?: string | null
          email?: string | null
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
          tipo_pessoa?: Database["public"]["Enums"]["tipo_pessoa"] | null
          updated_at?: string | null
          user_id?: string | null
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
      consultas_rastreamento: {
        Row: {
          ano_veiculo: string | null
          cliente_documento: string | null
          cliente_nome: string | null
          created_at: string
          id: string
          modelo_veiculo: string | null
          multas_encontradas: number
          organization_id: string
          placa: string
          resposta_api: Json | null
          status: string
          valor_cobrado: number
          veiculo_id: string
        }
        Insert: {
          ano_veiculo?: string | null
          cliente_documento?: string | null
          cliente_nome?: string | null
          created_at?: string
          id?: string
          modelo_veiculo?: string | null
          multas_encontradas?: number
          organization_id: string
          placa: string
          resposta_api?: Json | null
          status?: string
          valor_cobrado?: number
          veiculo_id: string
        }
        Update: {
          ano_veiculo?: string | null
          cliente_documento?: string | null
          cliente_nome?: string | null
          created_at?: string
          id?: string
          modelo_veiculo?: string | null
          multas_encontradas?: number
          organization_id?: string
          placa?: string
          resposta_api?: Json | null
          status?: string
          valor_cobrado?: number
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultas_rastreamento_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_rastreamento_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          alerta_ativo: boolean | null
          assinatura_data: Json | null
          auto_infracao: string | null
          cliente_id: string | null
          conteudo: string | null
          created_at: string | null
          data_protocolo: string | null
          data_proximo_lembrete: string | null
          data_ultima_notificacao: string | null
          fase_ait: string | null
          fase_processo: string | null
          forma_pagamento: string | null
          id: string
          intervalo_notificacao: string | null
          last_checkin_notified_at: string | null
          lembrete_ativado: boolean | null
          lido: boolean | null
          modelo_slug: string | null
          organization_id: string | null
          penalidades: string | null
          processo_administrativo: string | null
          servico_id: string | null
          status: string | null
          testemunhas: Json | null
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          alerta_ativo?: boolean | null
          assinatura_data?: Json | null
          auto_infracao?: string | null
          cliente_id?: string | null
          conteudo?: string | null
          created_at?: string | null
          data_protocolo?: string | null
          data_proximo_lembrete?: string | null
          data_ultima_notificacao?: string | null
          fase_ait?: string | null
          fase_processo?: string | null
          forma_pagamento?: string | null
          id?: string
          intervalo_notificacao?: string | null
          last_checkin_notified_at?: string | null
          lembrete_ativado?: boolean | null
          lido?: boolean | null
          modelo_slug?: string | null
          organization_id?: string | null
          penalidades?: string | null
          processo_administrativo?: string | null
          servico_id?: string | null
          status?: string | null
          testemunhas?: Json | null
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          alerta_ativo?: boolean | null
          assinatura_data?: Json | null
          auto_infracao?: string | null
          cliente_id?: string | null
          conteudo?: string | null
          created_at?: string | null
          data_protocolo?: string | null
          data_proximo_lembrete?: string | null
          data_ultima_notificacao?: string | null
          fase_ait?: string | null
          fase_processo?: string | null
          forma_pagamento?: string | null
          id?: string
          intervalo_notificacao?: string | null
          last_checkin_notified_at?: string | null
          lembrete_ativado?: boolean | null
          lido?: boolean | null
          modelo_slug?: string | null
          organization_id?: string | null
          penalidades?: string | null
          processo_administrativo?: string | null
          servico_id?: string | null
          status?: string | null
          testemunhas?: Json | null
          updated_at?: string | null
          valor?: number | null
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
          cliente_id: string | null
          created_at: string | null
          id: string
          tipo: string | null
          url: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          id?: string
          tipo?: string | null
          url?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          id?: string
          tipo?: string | null
          url?: string | null
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
          arquivos: Json | null
          cidade: string | null
          comprado_por: string | null
          created_at: string
          data_leitura: string | null
          data_publicacao: string
          descricao: string | null
          detran: string
          estado: string | null
          id: string
          nomes_vendidos: number
          prazo_recurso: string
          preco_por_nome: number
          quantidade_nomes: number
          status: string
          tipo_penalidade: string
          total_multas: number | null
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          arquivos?: Json | null
          cidade?: string | null
          comprado_por?: string | null
          created_at?: string
          data_leitura?: string | null
          data_publicacao: string
          descricao?: string | null
          detran: string
          estado?: string | null
          id?: string
          nomes_vendidos?: number
          prazo_recurso: string
          preco_por_nome?: number
          quantidade_nomes?: number
          status?: string
          tipo_penalidade: string
          total_multas?: number | null
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          arquivos?: Json | null
          cidade?: string | null
          comprado_por?: string | null
          created_at?: string
          data_leitura?: string | null
          data_publicacao?: string
          descricao?: string | null
          detran?: string
          estado?: string | null
          id?: string
          nomes_vendidos?: number
          prazo_recurso?: string
          preco_por_nome?: number
          quantidade_nomes?: number
          status?: string
          tipo_penalidade?: string
          total_multas?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "editais_comprado_por_fkey"
            columns: ["comprado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      editais_backup: {
        Row: {
          arquivo_url: string
          created_at: string | null
          data_publicacao: string | null
          descricao: string | null
          detran: string
          error_log: string | null
          id: string
          nome_arquivo: string | null
          nomes_vendidos: number | null
          prazo_recurso: string | null
          preco_por_nome: number | null
          processed_at: string | null
          quantidade_nomes: number | null
          status: string | null
          tamanho_bytes: number | null
          tipo_penalidade: string
          updated_at: string | null
        }
        Insert: {
          arquivo_url: string
          created_at?: string | null
          data_publicacao?: string | null
          descricao?: string | null
          detran: string
          error_log?: string | null
          id?: string
          nome_arquivo?: string | null
          nomes_vendidos?: number | null
          prazo_recurso?: string | null
          preco_por_nome?: number | null
          processed_at?: string | null
          quantidade_nomes?: number | null
          status?: string | null
          tamanho_bytes?: number | null
          tipo_penalidade: string
          updated_at?: string | null
        }
        Update: {
          arquivo_url?: string
          created_at?: string | null
          data_publicacao?: string | null
          descricao?: string | null
          detran?: string
          error_log?: string | null
          id?: string
          nome_arquivo?: string | null
          nomes_vendidos?: number | null
          prazo_recurso?: string | null
          preco_por_nome?: number | null
          processed_at?: string | null
          quantidade_nomes?: number | null
          status?: string | null
          tamanho_bytes?: number | null
          tipo_penalidade?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      edital_compras: {
        Row: {
          created_at: string | null
          edital_id: string | null
          id: string
          organization_id: string | null
          quantidade: number
          status: string | null
          updated_at: string | null
          valor_total: number
        }
        Insert: {
          created_at?: string | null
          edital_id?: string | null
          id?: string
          organization_id?: string | null
          quantidade: number
          status?: string | null
          updated_at?: string | null
          valor_total: number
        }
        Update: {
          created_at?: string | null
          edital_id?: string | null
          id?: string
          organization_id?: string | null
          quantidade?: number
          status?: string | null
          updated_at?: string | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "edital_compras_edital_id_fkey"
            columns: ["edital_id"]
            isOneToOne: false
            referencedRelation: "editais"
            referencedColumns: ["id"]
          },
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
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          id: string
          nome: string
          ordem: number | null
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          id?: string
          nome: string
          ordem?: number | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          organization_id?: string | null
          updated_at?: string | null
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
          organization_id: string | null
          plano_id: string | null
          status: Database["public"]["Enums"]["billing_status"] | null
          tipo: Database["public"]["Enums"]["billing_type"] | null
          updated_at: string | null
          url_boleto: string | null
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
          organization_id?: string | null
          plano_id?: string | null
          status?: Database["public"]["Enums"]["billing_status"] | null
          tipo?: Database["public"]["Enums"]["billing_type"] | null
          updated_at?: string | null
          url_boleto?: string | null
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
          organization_id?: string | null
          plano_id?: string | null
          status?: Database["public"]["Enums"]["billing_status"] | null
          tipo?: Database["public"]["Enums"]["billing_type"] | null
          updated_at?: string | null
          url_boleto?: string | null
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
          {
            foreignKeyName: "faturamento_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      fundamentos_legais: {
        Row: {
          ativo: boolean | null
          codigo_infracao: string | null
          conteudo: string
          created_at: string | null
          id: string
          ordem: number | null
          orgao_id: string | null
          tipo_recurso: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo_infracao?: string | null
          conteudo: string
          created_at?: string | null
          id?: string
          ordem?: number | null
          orgao_id?: string | null
          tipo_recurso: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo_infracao?: string | null
          conteudo?: string
          created_at?: string | null
          id?: string
          ordem?: number | null
          orgao_id?: string | null
          tipo_recurso?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fundamentos_legais_orgao_id_fkey"
            columns: ["orgao_id"]
            isOneToOne: false
            referencedRelation: "orgaos_transito"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_atividades: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          descricao: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          tipo?: string | null
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
      infracoes_transito: {
        Row: {
          artigo: string
          ativo: boolean | null
          categoria: string | null
          codigo: string
          created_at: string | null
          descricao: string
          gravidade: string
          id: string
          observacoes: string | null
          pontos: number
          suspende_cnh: boolean | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          artigo: string
          ativo?: boolean | null
          categoria?: string | null
          codigo: string
          created_at?: string | null
          descricao: string
          gravidade: string
          id?: string
          observacoes?: string | null
          pontos?: number
          suspende_cnh?: boolean | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          artigo?: string
          ativo?: boolean | null
          categoria?: string | null
          codigo?: string
          created_at?: string | null
          descricao?: string
          gravidade?: string
          id?: string
          observacoes?: string | null
          pontos?: number
          suspende_cnh?: boolean | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: []
      }
      legislacao_base: {
        Row: {
          arquivo_url: string | null
          artigos_relacionados: string[] | null
          ativo: boolean | null
          conteudo: string | null
          created_at: string | null
          data_publicacao: string | null
          data_vigencia: string | null
          descricao: string | null
          id: string
          is_global: boolean | null
          numero_resolucao: string | null
          palavras_chave: string[] | null
          tipo: string
          tipo_conteudo: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          arquivo_url?: string | null
          artigos_relacionados?: string[] | null
          ativo?: boolean | null
          conteudo?: string | null
          created_at?: string | null
          data_publicacao?: string | null
          data_vigencia?: string | null
          descricao?: string | null
          id?: string
          is_global?: boolean | null
          numero_resolucao?: string | null
          palavras_chave?: string[] | null
          tipo: string
          tipo_conteudo?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          arquivo_url?: string | null
          artigos_relacionados?: string[] | null
          ativo?: boolean | null
          conteudo?: string | null
          created_at?: string | null
          data_publicacao?: string | null
          data_vigencia?: string | null
          descricao?: string | null
          id?: string
          is_global?: boolean | null
          numero_resolucao?: string | null
          palavras_chave?: string[] | null
          tipo?: string
          tipo_conteudo?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      multas: {
        Row: {
          agente_autuador: string | null
          codigo_infracao: string | null
          created_at: string | null
          data_multa: string | null
          data_vencimento: string | null
          descricao: string | null
          gravidade: string | null
          hora_infracao: string | null
          id: string
          local_infracao: string | null
          municipio: string | null
          numero_auto: string | null
          observacoes: string | null
          orgao_autuador: string | null
          placa_autuada: string | null
          pontos: number | null
          status: Database["public"]["Enums"]["status_multa"] | null
          uf_infracao: string | null
          updated_at: string | null
          valor: number | null
          veiculo_id: string | null
        }
        Insert: {
          agente_autuador?: string | null
          codigo_infracao?: string | null
          created_at?: string | null
          data_multa?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          gravidade?: string | null
          hora_infracao?: string | null
          id?: string
          local_infracao?: string | null
          municipio?: string | null
          numero_auto?: string | null
          observacoes?: string | null
          orgao_autuador?: string | null
          placa_autuada?: string | null
          pontos?: number | null
          status?: Database["public"]["Enums"]["status_multa"] | null
          uf_infracao?: string | null
          updated_at?: string | null
          valor?: number | null
          veiculo_id?: string | null
        }
        Update: {
          agente_autuador?: string | null
          codigo_infracao?: string | null
          created_at?: string | null
          data_multa?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          gravidade?: string | null
          hora_infracao?: string | null
          id?: string
          local_infracao?: string | null
          municipio?: string | null
          numero_auto?: string | null
          observacoes?: string | null
          orgao_autuador?: string | null
          placa_autuada?: string | null
          pontos?: number | null
          status?: Database["public"]["Enums"]["status_multa"] | null
          uf_infracao?: string | null
          updated_at?: string | null
          valor?: number | null
          veiculo_id?: string | null
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
      notificacoes_multas: {
        Row: {
          created_at: string | null
          descricao: string
          id: string
          lido: boolean | null
          multa_id: string
          organization_id: string
          placa: string
          valor: number | null
          veiculo_id: string
        }
        Insert: {
          created_at?: string | null
          descricao: string
          id?: string
          lido?: boolean | null
          multa_id: string
          organization_id: string
          placa: string
          valor?: number | null
          veiculo_id: string
        }
        Update: {
          created_at?: string | null
          descricao?: string
          id?: string
          lido?: boolean | null
          multa_id?: string
          organization_id?: string
          placa?: string
          valor?: number | null
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_multas_multa_id_fkey"
            columns: ["multa_id"]
            isOneToOne: false
            referencedRelation: "multas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_multas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_multas_veiculo_id_fkey"
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
          acesso_institucional: boolean | null
          ativo: boolean | null
          cabecalho_logo_url: string | null
          cabecalho_texto: string | null
          cnpj: string | null
          cnpj_contrato: string | null
          cor_primaria: string | null
          cor_secundaria: string | null
          cpf: string | null
          created_at: string | null
          data_expiracao: string | null
          email: string | null
          email_contato: string | null
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
          plan: string | null
          plano: string | null
          rodape_texto: string | null
          saldo_bonus: number | null
          saldo_sacavel: number | null
          site_url: string | null
          slug: string | null
          telefone: string | null
          timbre_contrato_url: string | null
          updated_at: string | null
        }
        Insert: {
          acesso_crm?: boolean | null
          acesso_disparador?: boolean | null
          acesso_institucional?: boolean | null
          ativo?: boolean | null
          cabecalho_logo_url?: string | null
          cabecalho_texto?: string | null
          cnpj?: string | null
          cnpj_contrato?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          cpf?: string | null
          created_at?: string | null
          data_expiracao?: string | null
          email?: string | null
          email_contato?: string | null
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
          plan?: string | null
          plano?: string | null
          rodape_texto?: string | null
          saldo_bonus?: number | null
          saldo_sacavel?: number | null
          site_url?: string | null
          slug?: string | null
          telefone?: string | null
          timbre_contrato_url?: string | null
          updated_at?: string | null
        }
        Update: {
          acesso_crm?: boolean | null
          acesso_disparador?: boolean | null
          acesso_institucional?: boolean | null
          ativo?: boolean | null
          cabecalho_logo_url?: string | null
          cabecalho_texto?: string | null
          cnpj?: string | null
          cnpj_contrato?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          cpf?: string | null
          created_at?: string | null
          data_expiracao?: string | null
          email?: string | null
          email_contato?: string | null
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
          plan?: string | null
          plano?: string | null
          rodape_texto?: string | null
          saldo_bonus?: number | null
          saldo_sacavel?: number | null
          site_url?: string | null
          slug?: string | null
          telefone?: string | null
          timbre_contrato_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      orgaos_transito: {
        Row: {
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string
          id: string
          nome: string
          prazo_cetran: number | null
          prazo_defesa_previa: number | null
          prazo_jari: number | null
          sigla_estado: string
          site_url: string | null
          telefone: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado: string
          id?: string
          nome: string
          prazo_cetran?: number | null
          prazo_defesa_previa?: number | null
          prazo_jari?: number | null
          sigla_estado: string
          site_url?: string | null
          telefone?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string
          id?: string
          nome?: string
          prazo_cetran?: number | null
          prazo_defesa_previa?: number | null
          prazo_jari?: number | null
          sigla_estado?: string
          site_url?: string | null
          telefone?: string | null
          tipo?: string
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
          limite_usuarios: number | null
          marketing_digital: string | null
          modulo_educacional: string | null
          nome: string
          organization_id: string | null
          preco: number
          preco_edital: number | null
          preco_mensal: number | null
          preco_rastreamento: number | null
          preco_recurso_ia: number | null
          rastreamento_anual_frota_preco: number | null
          rastreamento_anual_pf_preco: number | null
          rastreamento_frota_preco: number | null
          rastreamento_garantido_preco: number | null
          rastreamento_mensal_frota_preco: number | null
          rastreamento_mensal_pf_preco: number | null
          rastreamento_pf_preco: number | null
          recursos: Json | null
          recursos_ia_inclusos: number | null
          recursos_ia_suspensao_inclusos: number | null
          recursos_ia_suspensao_preco_adicional: number | null
          slug: string | null
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
          limite_usuarios?: number | null
          marketing_digital?: string | null
          modulo_educacional?: string | null
          nome: string
          organization_id?: string | null
          preco: number
          preco_edital?: number | null
          preco_mensal?: number | null
          preco_rastreamento?: number | null
          preco_recurso_ia?: number | null
          rastreamento_anual_frota_preco?: number | null
          rastreamento_anual_pf_preco?: number | null
          rastreamento_frota_preco?: number | null
          rastreamento_garantido_preco?: number | null
          rastreamento_mensal_frota_preco?: number | null
          rastreamento_mensal_pf_preco?: number | null
          rastreamento_pf_preco?: number | null
          recursos?: Json | null
          recursos_ia_inclusos?: number | null
          recursos_ia_suspensao_inclusos?: number | null
          recursos_ia_suspensao_preco_adicional?: number | null
          slug?: string | null
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
          limite_usuarios?: number | null
          marketing_digital?: string | null
          modulo_educacional?: string | null
          nome?: string
          organization_id?: string | null
          preco?: number
          preco_edital?: number | null
          preco_mensal?: number | null
          preco_rastreamento?: number | null
          preco_recurso_ia?: number | null
          rastreamento_anual_frota_preco?: number | null
          rastreamento_anual_pf_preco?: number | null
          rastreamento_frota_preco?: number | null
          rastreamento_garantido_preco?: number | null
          rastreamento_mensal_frota_preco?: number | null
          rastreamento_mensal_pf_preco?: number | null
          rastreamento_pf_preco?: number | null
          recursos?: Json | null
          recursos_ia_inclusos?: number | null
          recursos_ia_suspensao_inclusos?: number | null
          recursos_ia_suspensao_preco_adicional?: number | null
          slug?: string | null
          suporte?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rastreamento_cobrancas: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          referencia_mes: string
          status: Database["public"]["Enums"]["billing_status"] | null
          updated_at: string | null
          valor: number
          veiculo_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          referencia_mes: string
          status?: Database["public"]["Enums"]["billing_status"] | null
          updated_at?: string | null
          valor: number
          veiculo_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          referencia_mes?: string
          status?: Database["public"]["Enums"]["billing_status"] | null
          updated_at?: string | null
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
          ait_dados_extraidos: Json | null
          ait_url: string | null
          cliente_id: string | null
          conteudo: string | null
          contrato_id: string | null
          created_at: string | null
          data_protocolo: string | null
          data_ultima_notificacao: string | null
          id: string
          instancia: Database["public"]["Enums"]["instancia_recurso"]
          is_ia: boolean | null
          multa_id: string | null
          numero_protocolo: string | null
          observacoes: string | null
          organization_id: string | null
          status: Database["public"]["Enums"]["status_recurso"] | null
          updated_at: string | null
          veiculo_id: string | null
        }
        Insert: {
          ait_dados_extraidos?: Json | null
          ait_url?: string | null
          cliente_id?: string | null
          conteudo?: string | null
          contrato_id?: string | null
          created_at?: string | null
          data_protocolo?: string | null
          data_ultima_notificacao?: string | null
          id?: string
          instancia: Database["public"]["Enums"]["instancia_recurso"]
          is_ia?: boolean | null
          multa_id?: string | null
          numero_protocolo?: string | null
          observacoes?: string | null
          organization_id?: string | null
          status?: Database["public"]["Enums"]["status_recurso"] | null
          updated_at?: string | null
          veiculo_id?: string | null
        }
        Update: {
          ait_dados_extraidos?: Json | null
          ait_url?: string | null
          cliente_id?: string | null
          conteudo?: string | null
          contrato_id?: string | null
          created_at?: string | null
          data_protocolo?: string | null
          data_ultima_notificacao?: string | null
          id?: string
          instancia?: Database["public"]["Enums"]["instancia_recurso"]
          is_ia?: boolean | null
          multa_id?: string | null
          numero_protocolo?: string | null
          observacoes?: string | null
          organization_id?: string | null
          status?: Database["public"]["Enums"]["status_recurso"] | null
          updated_at?: string | null
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recursos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recursos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "recursos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      recursos_conhecimento: {
        Row: {
          argumentos_chave: string[] | null
          arquivo_ait_url: string | null
          arquivo_deferimento_url: string | null
          codigo_infracao: string
          conteudo: string
          created_at: string | null
          dados_extraidos_ia: Json | null
          data_deferimento: string | null
          detran_estado: string | null
          id: string
          is_global: boolean | null
          observacoes: string | null
          organization_id: string | null
          recurso_origem_id: string | null
          resultado: string | null
          status_aprovacao: string | null
          tipo_recurso: string
          updated_at: string | null
        }
        Insert: {
          argumentos_chave?: string[] | null
          arquivo_ait_url?: string | null
          arquivo_deferimento_url?: string | null
          codigo_infracao: string
          conteudo: string
          created_at?: string | null
          dados_extraidos_ia?: Json | null
          data_deferimento?: string | null
          detran_estado?: string | null
          id?: string
          is_global?: boolean | null
          observacoes?: string | null
          organization_id?: string | null
          recurso_origem_id?: string | null
          resultado?: string | null
          status_aprovacao?: string | null
          tipo_recurso: string
          updated_at?: string | null
        }
        Update: {
          argumentos_chave?: string[] | null
          arquivo_ait_url?: string | null
          arquivo_deferimento_url?: string | null
          codigo_infracao?: string
          conteudo?: string
          created_at?: string | null
          dados_extraidos_ia?: Json | null
          data_deferimento?: string | null
          detran_estado?: string | null
          id?: string
          is_global?: boolean | null
          observacoes?: string | null
          organization_id?: string | null
          recurso_origem_id?: string | null
          resultado?: string | null
          status_aprovacao?: string | null
          tipo_recurso?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recursos_conhecimento_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recursos_conhecimento_recurso_origem_id_fkey"
            columns: ["recurso_origem_id"]
            isOneToOne: false
            referencedRelation: "recursos"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean | null
          campos_dinamicos: Json | null
          contrato_modelo: string | null
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          organization_id: string | null
          preco: number | null
          preco_base: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          campos_dinamicos?: Json | null
          contrato_modelo?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          organization_id?: string | null
          preco?: number | null
          preco_base?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          campos_dinamicos?: Json | null
          contrato_modelo?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          organization_id?: string | null
          preco?: number | null
          preco_base?: number | null
          updated_at?: string | null
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
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_secret: boolean | null
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_secret?: boolean | null
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_secret?: boolean | null
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      templates_recursos: {
        Row: {
          ativo: boolean | null
          cabecalho: string | null
          codigo_infracao: string | null
          corpo: string
          created_at: string | null
          id: string
          orgao_id: string | null
          prompt_ia: string | null
          rodape: string | null
          tipo_recurso: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cabecalho?: string | null
          codigo_infracao?: string | null
          corpo: string
          created_at?: string | null
          id?: string
          orgao_id?: string | null
          prompt_ia?: string | null
          rodape?: string | null
          tipo_recurso: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cabecalho?: string | null
          codigo_infracao?: string | null
          corpo?: string
          created_at?: string | null
          id?: string
          orgao_id?: string | null
          prompt_ia?: string | null
          rodape?: string | null
          tipo_recurso?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_recursos_orgao_id_fkey"
            columns: ["orgao_id"]
            isOneToOne: false
            referencedRelation: "orgaos_transito"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organizations: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
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
          role: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          nome?: string | null
          role?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string | null
          role?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      veiculos: {
        Row: {
          ano: string | null
          ativo: boolean | null
          caixa_cambio: string | null
          capacidade_passageiros: string | null
          chassi: string | null
          cilindradas: string | null
          cliente_id: string | null
          cor: string | null
          created_at: string | null
          especie: string | null
          id: string
          modelo: string
          motor: string | null
          municipio: string | null
          placa: string
          potencia: string | null
          quantidade_eixos: string | null
          rastreamento_ativo: boolean | null
          rastreamento_inicio: string | null
          rastreamento_notificado: boolean | null
          rastreamento_tipo: string | null
          rastreamento_valor: number | null
          rastreamento_vencimento: string | null
          renavam: string | null
          situacao_veiculo: string | null
          uf: string | null
          ultima_sincronizacao: string | null
          updated_at: string | null
        }
        Insert: {
          ano?: string | null
          ativo?: boolean | null
          caixa_cambio?: string | null
          capacidade_passageiros?: string | null
          chassi?: string | null
          cilindradas?: string | null
          cliente_id?: string | null
          cor?: string | null
          created_at?: string | null
          especie?: string | null
          id?: string
          modelo: string
          motor?: string | null
          municipio?: string | null
          placa: string
          potencia?: string | null
          quantidade_eixos?: string | null
          rastreamento_ativo?: boolean | null
          rastreamento_inicio?: string | null
          rastreamento_notificado?: boolean | null
          rastreamento_tipo?: string | null
          rastreamento_valor?: number | null
          rastreamento_vencimento?: string | null
          renavam?: string | null
          situacao_veiculo?: string | null
          uf?: string | null
          ultima_sincronizacao?: string | null
          updated_at?: string | null
        }
        Update: {
          ano?: string | null
          ativo?: boolean | null
          caixa_cambio?: string | null
          capacidade_passageiros?: string | null
          chassi?: string | null
          cilindradas?: string | null
          cliente_id?: string | null
          cor?: string | null
          created_at?: string | null
          especie?: string | null
          id?: string
          modelo?: string
          motor?: string | null
          municipio?: string | null
          placa?: string
          potencia?: string | null
          quantidade_eixos?: string | null
          rastreamento_ativo?: boolean | null
          rastreamento_inicio?: string | null
          rastreamento_notificado?: boolean | null
          rastreamento_tipo?: string | null
          rastreamento_valor?: number | null
          rastreamento_vencimento?: string | null
          renavam?: string | null
          situacao_veiculo?: string | null
          uf?: string | null
          ultima_sincronizacao?: string | null
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
      get_user_organization_ids: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      user_belongs_to_organization: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: boolean
      }
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
