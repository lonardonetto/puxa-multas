import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface MultaParaEditar {
  id: string;
  placa: string;
  codigoInfracao: string;
  descricaoInfracao: string;
  valor: number;
  pontos: number;
  gravidade?: string | null;
  dataMulta: string;
  horaInfracao?: string | null;
  numeroAuto?: string | null;
  localInfracao?: string | null;
  orgaoAutuador?: string | null;
  municipio?: string | null;
  ufInfracao?: string | null;
  status: string;
}

interface Props {
  multa: MultaParaEditar | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'suspensiva', label: 'Suspensiva' },
  { value: 'analise', label: 'Em Análise' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'pago', label: 'Pago' },
];

const GRAVIDADE_OPTIONS = [
  { value: 'leve', label: 'Leve' },
  { value: 'media', label: 'Média' },
  { value: 'grave', label: 'Grave' },
  { value: 'gravissima', label: 'Gravíssima' },
];

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function ModalEditarMulta({ multa, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    codigo_infracao: '',
    descricao: '',
    valor: 0,
    pontos: 0,
    gravidade: '',
    data_multa: '',
    hora_infracao: '',
    numero_auto: '',
    local_infracao: '',
    orgao_autuador: '',
    municipio: '',
    uf_infracao: '',
    status: 'pendente',
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (multa) {
      setFormData({
        codigo_infracao: multa.codigoInfracao || '',
        descricao: multa.descricaoInfracao || '',
        valor: multa.valor || 0,
        pontos: multa.pontos || 0,
        gravidade: multa.gravidade || '',
        data_multa: multa.dataMulta || '',
        hora_infracao: multa.horaInfracao || '',
        numero_auto: multa.numeroAuto || '',
        local_infracao: multa.localInfracao || '',
        orgao_autuador: multa.orgaoAutuador || '',
        municipio: multa.municipio || '',
        uf_infracao: multa.ufInfracao || '',
        status: multa.status || 'pendente',
      });
    }
  }, [multa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!multa) return;

    setSalvando(true);
    try {
      const { error } = await supabase
        .from('multas')
        .update({
          codigo_infracao: formData.codigo_infracao,
          descricao: formData.descricao,
          valor: formData.valor,
          pontos: formData.pontos,
          gravidade: formData.gravidade || null,
          data_multa: formData.data_multa || null,
          hora_infracao: formData.hora_infracao || null,
          numero_auto: formData.numero_auto || null,
          local_infracao: formData.local_infracao || null,
          orgao_autuador: formData.orgao_autuador || null,
          municipio: formData.municipio || null,
          uf_infracao: formData.uf_infracao || null,
          status: formData.status as 'pendente' | 'suspensiva' | 'analise' | 'concluido' | 'pago',
          updated_at: new Date().toISOString(),
        })
        .eq('id', multa.id);

      if (error) throw error;

      toast.success('Multa atualizada com sucesso!');
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar multa:', error);
      toast.error('Erro ao atualizar multa');
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen || !multa) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Editar Multa</h3>
            <p className="text-sm text-gray-500">Veículo: {multa.placa}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código da Infração
              </label>
              <input
                type="text"
                value={formData.codigo_infracao}
                onChange={(e) => setFormData({ ...formData, codigo_infracao: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 51851"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição da Infração
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Descrição da infração..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pontos
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.pontos}
                onChange={(e) => setFormData({ ...formData, pontos: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gravidade
              </label>
              <select
                value={formData.gravidade}
                onChange={(e) => setFormData({ ...formData, gravidade: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Selecione...</option>
                {GRAVIDADE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data da Multa
              </label>
              <input
                type="date"
                value={formData.data_multa}
                onChange={(e) => setFormData({ ...formData, data_multa: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hora da Infração
              </label>
              <input
                type="time"
                value={formData.hora_infracao}
                onChange={(e) => setFormData({ ...formData, hora_infracao: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número do Auto
              </label>
              <input
                type="text"
                value={formData.numero_auto}
                onChange={(e) => setFormData({ ...formData, numero_auto: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Número do auto de infração"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Órgão Autuador
              </label>
              <input
                type="text"
                value={formData.orgao_autuador}
                onChange={(e) => setFormData({ ...formData, orgao_autuador: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: DETRAN-SP"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Local da Infração
            </label>
            <input
              type="text"
              value={formData.local_infracao}
              onChange={(e) => setFormData({ ...formData, local_infracao: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Endereço ou local da infração"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Município
              </label>
              <input
                type="text"
                value={formData.municipio}
                onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cidade"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                UF
              </label>
              <select
                value={formData.uf_infracao}
                onChange={(e) => setFormData({ ...formData, uf_infracao: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">Selecione...</option>
                {UF_OPTIONS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {salvando ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Salvando...
                </>
              ) : (
                <>
                  <i className="ri-save-line mr-2"></i>
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
