import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

export default function SuperAdminAuditoria() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroOrg, setFiltroOrg] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('30');
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, hoje: 0, semana: 0, usuarios: 0 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load organizations for filter
      const { data: orgs } = await supabase.from('organizations').select('id, nome').order('nome');
      setOrganizations(orgs || []);

      // Build query
      let query = supabase
        .from('registro_notificacoes' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (filtroOrg) {
        query = query.eq('organization_id', filtroOrg);
      }

      if (filtroUsuario) {
        query = query.or(`usuario_nome.ilike.%${filtroUsuario}%,usuario_email.ilike.%${filtroUsuario}%`);
      }

      if (filtroPeriodo !== 'todos') {
        const dias = parseInt(filtroPeriodo);
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - dias);
        query = query.gte('created_at', dataLimite.toISOString());
      }

      const { data } = await query;
      const regs = data || [];
      setRegistros(regs);

      // Calc stats
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const semanaAtras = new Date();
      semanaAtras.setDate(semanaAtras.getDate() - 7);

      const usuariosUnicos = new Set(regs.map((r: any) => r.usuario_id));
      setStats({
        total: regs.length,
        hoje: regs.filter((r: any) => new Date(r.created_at) >= hoje).length,
        semana: regs.filter((r: any) => new Date(r.created_at) >= semanaAtras).length,
        usuarios: usuariosUnicos.size,
      });
    } catch (err) {
      console.error('Erro ao carregar auditoria:', err);
    } finally {
      setLoading(false);
    }
  }, [filtroOrg, filtroUsuario, filtroPeriodo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getOrgNome = (orgId: string) => {
    return organizations.find(o => o.id === orgId)?.nome || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <i className="ri-shield-check-line text-blue-600"></i>
            Auditoria de Notificações
          </h2>
          <p className="text-sm text-gray-600 mt-1">Registro blindado e imutável de todas as notificações enviadas por todas as organizações</p>
        </div>
        <button onClick={loadData} disabled={loading} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
          <i className={`ri-refresh-line text-lg ${loading ? 'animate-spin' : ''}`}></i>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total de Registros', value: stats.total, icon: 'ri-file-shield-2-line', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Hoje', value: stats.hoje, icon: 'ri-calendar-check-line', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Últimos 7 dias', value: stats.semana, icon: 'ri-calendar-line', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Operadores Ativos', value: stats.usuarios, icon: 'ri-user-star-line', color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
                <i className={`${card.icon} text-2xl ${card.color}`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <i className="ri-filter-3-line text-gray-400"></i>
            <span className="text-xs font-bold text-gray-500 uppercase">Filtros:</span>
          </div>
          <select
            value={filtroOrg}
            onChange={(e) => setFiltroOrg(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Todas as Organizações</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.nome}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Buscar por operador..."
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48"
          />
          <select
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
            <option value="todos">Todos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Data/Hora (Brasília)', 'Operador', 'Organização', 'Cliente Notificado', 'Auto Infração', 'Status', 'Integridade'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500 text-sm"><i className="ri-loader-4-line animate-spin mr-2"></i>Carregando registros...</td></tr>
              ) : registros.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">Nenhum registro encontrado.</td></tr>
              ) : (
                registros.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-xs font-bold text-gray-800">{reg.horario_brasilia}</div>
                      <div className="text-[9px] text-gray-400 font-mono mt-0.5">IP: {reg.ip_address || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-blue-700">{reg.usuario_nome?.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-800">{reg.usuario_nome}</div>
                          <div className="text-[10px] text-gray-400">{reg.usuario_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 font-medium">{getOrgNome(reg.organization_id)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold text-gray-800">{reg.cliente_nome}</div>
                      <div className="text-[10px] text-gray-400">{reg.cliente_telefone || 'Sem telefone'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-gray-700">{reg.auto_infracao || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                        <i className="ri-shield-check-line mr-0.5"></i>
                        {reg.confirmacao_usuario ? 'Confirmado' : 'Não confirmado'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <i className="ri-lock-line text-green-500 text-xs"></i>
                        <span className="font-mono text-[9px] text-gray-400" title={reg.hash_integridade}>
                          {reg.hash_integridade?.substring(0, 12)}...
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {registros.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              <i className="ri-information-line mr-1"></i>
              Exibindo {registros.length} registros. Dados imutáveis protegidos por hash SHA-256.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
              <i className="ri-shield-star-line"></i>
              Auditoria Blindada
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
