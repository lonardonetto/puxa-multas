import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface VeiculoParaEditar {
  id: string;
  placa: string;
  modelo: string;
  ano: string | null;
  renavam: string | null;
  rastreamento_ativo: boolean;
  rastreamento_valor: number;
  cliente_id: string;
  cliente_nome: string;
}

interface Props {
  veiculo: VeiculoParaEditar | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ModalEditarVeiculo({ veiculo, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    ano: '',
    renavam: '',
    rastreamento_ativo: true,
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (veiculo) {
      setFormData({
        placa: veiculo.placa || '',
        modelo: veiculo.modelo || '',
        ano: veiculo.ano || '',
        renavam: veiculo.renavam || '',
        rastreamento_ativo: veiculo.rastreamento_ativo,
      });
    }
  }, [veiculo]);

  if (!isOpen || !veiculo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.placa.trim()) {
      toast.error('A placa é obrigatória');
      return;
    }

    if (!formData.modelo.trim()) {
      toast.error('O modelo é obrigatório');
      return;
    }

    setSalvando(true);

    try {
      const { error } = await supabase
        .from('veiculos')
        .update({
          placa: formData.placa.toUpperCase().replace(/[^A-Z0-9]/g, ''),
          modelo: formData.modelo,
          ano: formData.ano || null,
          renavam: formData.renavam || null,
          rastreamento_ativo: formData.rastreamento_ativo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', veiculo.id);

      if (error) throw error;

      toast.success('Veículo atualizado com sucesso!');
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      toast.error('Erro ao atualizar veículo');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Editar Veículo</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              <i className="ri-user-line mr-1"></i>
              Cliente: <strong>{veiculo.cliente_nome}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Placa *
            </label>
            <input
              type="text"
              required
              value={formData.placa}
              onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ABC1234"
              maxLength={7}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Modelo *
            </label>
            <input
              type="text"
              required
              value={formData.modelo}
              onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Honda Civic"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ano
              </label>
              <input
                type="text"
                value={formData.ano}
                onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2024"
                maxLength={4}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                RENAVAM
              </label>
              <input
                type="text"
                value={formData.renavam}
                onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00000000000"
                maxLength={11}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 py-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rastreamento_ativo}
                onChange={(e) => setFormData({ ...formData, rastreamento_ativo: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">
              Rastreamento ativo
            </span>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {salvando ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Salvando...
                </>
              ) : (
                <>
                  <i className="ri-check-line mr-2"></i>
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
