import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

interface PlacaConsultada {
  placa?: string;
  Placa?: string;
  dataConsulta?: string;
  DataConsulta?: string;
  status?: string;
  Status?: string;
  ativa?: boolean;
  Ativa?: boolean;
  [key: string]: unknown;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export default function PlacasConsultadasPage() {
  const [placas, setPlacas] = useState<PlacaConsultada[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const fetchPlacas = async () => {
    setLoading(true);
    setErro(null);
    try {
      const { data, error } = await supabase.functions.invoke('listar-placas-consultadas');

      if (error) throw error;

      if (data?.success && data?.data) {
        const lista = Array.isArray(data.data) ? data.data : [];
        setPlacas(lista);
      } else {
        setPlacas([]);
        if (data?.error) setErro(data.error);
      }
    } catch (err: any) {
      console.error('Erro ao buscar placas:', err);
      setErro(err.message || 'Erro ao buscar placas consultadas');
      toast.error('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacas();
  }, []);

  const getPlaca = (item: PlacaConsultada) => item.placa || item.Placa || '-';
  const getData = (item: PlacaConsultada) => item.dataConsulta || item.DataConsulta || null;
  const getStatus = (item: PlacaConsultada) => item.status || item.Status || '-';
  const getAtiva = (item: PlacaConsultada) => item.ativa ?? item.Ativa ?? null;

  const placasFiltradas = placas.filter(p => {
    if (!busca) return true;
    const placa = getPlaca(p).toLowerCase();
    return placa.includes(busca.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Placas Consultadas</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Relatório de todas as placas consultadas na base CertaDoc
          </p>
        </div>
        <button
          onClick={fetchPlacas}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <i className={`ri-refresh-line ${loading ? 'animate-spin' : ''}`}></i>
          Atualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="ri-car-line text-primary text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Placas</p>
              <p className="text-2xl font-bold text-foreground">{placas.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-success text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ativas</p>
              <p className="text-2xl font-bold text-foreground">
                {placas.filter(p => getAtiva(p) === true).length || '-'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <i className="ri-close-circle-line text-destructive text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inativas</p>
              <p className="text-2xl font-bold text-foreground">
                {placas.filter(p => getAtiva(p) === false).length || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
        <input
          type="text"
          placeholder="Buscar por placa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Erro */}
      {erro && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3">
          <i className="ri-error-warning-line text-destructive text-xl"></i>
          <p className="text-sm text-destructive">{erro}</p>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Consultando CertaDoc...</span>
          </div>
        ) : placasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <i className="ri-car-line text-4xl mb-2"></i>
            <p>{busca ? 'Nenhuma placa encontrada com esse filtro' : 'Nenhuma placa consultada encontrada'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">#</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Placa</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Data Consulta</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Situação</th>
                {/* Render extra columns dynamically */}
                {placasFiltradas.length > 0 && Object.keys(placasFiltradas[0]).filter(k => 
                  !['placa', 'Placa', 'dataConsulta', 'DataConsulta', 'status', 'Status', 'ativa', 'Ativa'].includes(k)
                ).map(key => (
                  <th key={key} className="text-left py-3 px-4 text-sm font-semibold text-foreground capitalize">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {placasFiltradas.map((item, idx) => {
                const ativa = getAtiva(item);
                const extraKeys = Object.keys(item).filter(k => 
                  !['placa', 'Placa', 'dataConsulta', 'DataConsulta', 'status', 'Status', 'ativa', 'Ativa'].includes(k)
                );

                return (
                  <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-sm text-muted-foreground">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-foreground bg-muted px-2 py-1 rounded font-mono">
                        {getPlaca(item)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatDate(getData(item))}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {getStatus(item)}
                    </td>
                    <td className="py-3 px-4">
                      {ativa !== null ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          ativa 
                            ? 'bg-success/10 text-success' 
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          <i className={ativa ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'}></i>
                          {ativa ? 'Ativa' : 'Inativa'}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    {extraKeys.map(key => (
                      <td key={key} className="py-3 px-4 text-sm text-muted-foreground">
                        {typeof item[key] === 'object' ? JSON.stringify(item[key]) : String(item[key] ?? '-')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
