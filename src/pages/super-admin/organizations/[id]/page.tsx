import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import AddCreditsModal from '@/components/super-admin/AddCreditsModal';

interface OrganizationDetails {
  id: string;
  nome: string;
  plano: string;
  email: string;
  telefone: string;
  cnpj: string;
  endereco_completo: string;
  saldo_sacavel: number;
  saldo_bonus: number;
  ativo: boolean;
  created_at: string;
  total_clientes: number;
  total_recursos: number;
  total_contratos: number;
  veiculos_rastreados: number;
  gasto_total: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function OrganizationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<OrganizationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [faturamento, setFaturamento] = useState<any[]>([]);

  const fetchOrganization = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Buscar dados da organização
      const { data: orgData, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Buscar estatísticas
      const [clientesRes, recursosRes, contratosRes, veiculosRes, gastoRes, faturamentoRes] = await Promise.all([
        supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('organization_id', id),
        supabase.from('recursos').select('*', { count: 'exact', head: true }).eq('organization_id', id),
        supabase.from('contratos').select('*', { count: 'exact', head: true }).eq('organization_id', id),
        supabase.from('veiculos').select('*, clientes!inner(organization_id)', { count: 'exact', head: true })
          .eq('rastreamento_ativo', true)
          .eq('clientes.organization_id', id),
        supabase.from('faturamento').select('valor')
          .eq('organization_id', id)
          .eq('tipo', 'system_usage')
          .eq('status', 'paid'),
        supabase.from('faturamento').select('*')
          .eq('organization_id', id)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      const gastoTotal = (gastoRes.data || []).reduce((acc: number, f: any) => acc + (f.valor || 0), 0);

      setOrg({
        ...orgData,
        total_clientes: clientesRes.count || 0,
        total_recursos: recursosRes.count || 0,
        total_contratos: contratosRes.count || 0,
        veiculos_rastreados: veiculosRes.count || 0,
        gasto_total: gastoTotal,
      });

      setFaturamento(faturamentoRes.data || []);
    } catch (err) {
      console.error('Erro ao buscar organização:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <i className="ri-loader-4-line text-4xl text-primary animate-spin"></i>
          <p className="text-muted-foreground font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <i className="ri-error-warning-line text-4xl text-muted-foreground"></i>
        <p className="text-muted-foreground">Organização não encontrada</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <i className="ri-arrow-left-line text-xl text-muted-foreground"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{org.nome}</h1>
            <p className="text-muted-foreground">
              Desde {new Date(org.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            org.plano === 'top' ? 'bg-amber-100 text-amber-700' :
            org.plano === 'intermediario' ? 'bg-blue-100 text-blue-700' :
            org.plano === 'gratuito' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {org.plano || 'Sem plano'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            org.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {org.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <button
          onClick={() => setShowCreditsModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <i className="ri-add-circle-line"></i>
          Adicionar Créditos
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-md border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-wallet-3-line text-xl text-green-600"></i>
            </div>
            <p className="text-sm text-muted-foreground">Saldo Disponível</p>
          </div>
          <p className="text-2xl font-black text-green-600">{formatCurrency(org.saldo_sacavel)}</p>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-md border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="ri-gift-line text-xl text-purple-600"></i>
            </div>
            <p className="text-sm text-muted-foreground">Bônus</p>
          </div>
          <p className="text-2xl font-black text-purple-600">{formatCurrency(org.saldo_bonus)}</p>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-md border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <i className="ri-bar-chart-line text-xl text-indigo-600"></i>
            </div>
            <p className="text-sm text-muted-foreground">Total Consumido</p>
          </div>
          <p className="text-2xl font-black text-foreground">{formatCurrency(org.gasto_total)}</p>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-md border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-user-star-line text-xl text-blue-600"></i>
            </div>
            <p className="text-sm text-muted-foreground">Clientes Cadastrados</p>
          </div>
          <p className="text-2xl font-black text-foreground">{org.total_clientes}</p>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 shadow-md border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">Uso da Plataforma</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <i className="ri-robot-line text-indigo-600"></i>
                <span className="text-sm font-medium">Recursos IA Gerados</span>
              </div>
              <span className="font-bold text-indigo-600">{org.total_recursos}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <i className="ri-file-text-line text-blue-600"></i>
                <span className="text-sm font-medium">Contratos Criados</span>
              </div>
              <span className="font-bold text-blue-600">{org.total_contratos}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <i className="ri-car-line text-green-600"></i>
                <span className="text-sm font-medium">Veículos Rastreados</span>
              </div>
              <span className="font-bold text-green-600">{org.veiculos_rastreados}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-md border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">Informações de Contato</h3>
          <div className="space-y-3">
            {org.email && (
              <div className="flex items-center gap-3 text-sm">
                <i className="ri-mail-line text-muted-foreground"></i>
                <span>{org.email}</span>
              </div>
            )}
            {org.telefone && (
              <div className="flex items-center gap-3 text-sm">
                <i className="ri-phone-line text-muted-foreground"></i>
                <span>{org.telefone}</span>
              </div>
            )}
            {org.cnpj && (
              <div className="flex items-center gap-3 text-sm">
                <i className="ri-building-line text-muted-foreground"></i>
                <span>CNPJ: {org.cnpj}</span>
              </div>
            )}
            {org.endereco_completo && (
              <div className="flex items-center gap-3 text-sm">
                <i className="ri-map-pin-line text-muted-foreground"></i>
                <span>{org.endereco_completo}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">Últimas Transações</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Data</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Descrição</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Valor</th>
              </tr>
            </thead>
            <tbody>
              {faturamento.map((item, index) => (
                <tr key={item.id} className={`border-b border-border/50 ${index % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="py-3 px-4">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4">
                    {item.descricao || 'Sem descrição'}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.tipo === 'adjustment' ? 'bg-green-100 text-green-700' :
                      item.tipo === 'system_usage' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.tipo === 'adjustment' ? 'Crédito' :
                       item.tipo === 'system_usage' ? 'Consumo' :
                       item.tipo}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'paid' ? 'bg-green-100 text-green-700' :
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status === 'paid' ? 'Pago' :
                       item.status === 'pending' ? 'Pendente' :
                       item.status}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className={item.tipo === 'system_usage' ? 'text-red-600' : 'text-green-600'}>
                      {item.tipo === 'system_usage' ? '-' : '+'}{formatCurrency(item.valor)}
                    </span>
                  </td>
                </tr>
              ))}
              {faturamento.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Nenhuma transação encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adicionar Créditos */}
      {showCreditsModal && (
        <AddCreditsModal
          organization={{
            id: org.id,
            nome: org.nome,
            saldo_sacavel: org.saldo_sacavel,
            saldo_bonus: org.saldo_bonus,
          }}
          onClose={() => setShowCreditsModal(false)}
          onSuccess={() => fetchOrganization()}
        />
      )}
    </div>
  );
}
