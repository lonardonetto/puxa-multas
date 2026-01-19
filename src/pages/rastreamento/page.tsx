import { useState } from 'react';

export default function Rastreamento() {
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoRastreamento, setTipoRastreamento] = useState<'frota' | 'individual' | null>(null);
  const [formData, setFormData] = useState({
    nomeCliente: '',
    cpfCnpj: '',
    email: '',
    telefone: '',
    placas: [''],
    nomeEmpresa: '',
    numeroVeiculos: '',
  });

  const multas = [
    { id: 1, placa: 'ABC-1234', tipo: '5169 - Dirigir sob efeito de substância que cause dependência', status: 'suspensiva', data: '15/12/2024', valor: 'R$ 2.934,70', pontos: 7 },
    { id: 2, placa: 'DEF-5678', tipo: '5797 - Estacionar em desacordo com a regulamentação', status: 'analise', data: '14/12/2024', valor: 'R$ 130,16', pontos: 3 },
    { id: 3, placa: 'GHI-9012', tipo: '5274 - Manobras perigosas (arrancada brusca, derrapagem ou frenagem)', status: 'suspensiva', data: '13/12/2024', valor: 'R$ 2.934,70', pontos: 7 },
    { id: 4, placa: 'JKL-3456', tipo: '5240 - Disputar corrida (racha)', status: 'concluido', data: '12/12/2024', valor: 'R$ 2.934,70', pontos: 7 },
    { id: 5, placa: 'MNO-7890', tipo: '5266 - Participar em competição ou evento sem permissão', status: 'analise', data: '11/12/2024', valor: 'R$ 2.934,70', pontos: 7 },
    { id: 6, placa: 'PQR-2345', tipo: '5290 - Deixar de adotar providências para evitar perigo no trânsito', status: 'suspensiva', data: '10/12/2024', valor: 'R$ 957,70', pontos: 7 },
    { id: 7, placa: 'STU-6789', tipo: '7617 - Interromper ou perturbar a circulação da via sem autorização', status: 'concluido', data: '09/12/2024', valor: 'R$ 5.746,20', pontos: 7 },
    { id: 8, placa: 'VWX-0123', tipo: '7579 - Forçar passagem entre veículos em sentidos opostos', status: 'analise', data: '08/12/2024', valor: 'R$ 2.934,70', pontos: 7 },
    { id: 9, placa: 'YZA-4567', tipo: '7471 - Transitar em velocidade superior à máxima em mais de 50%', status: 'concluido', data: '07/12/2024', valor: 'R$ 880,41', pontos: 7 },
    { id: 10, placa: 'BCD-8901', tipo: '5029 - Dirigir veículo com CNH ou PPD cassada', status: 'suspensiva', data: '06/12/2024', valor: 'R$ 880,41', pontos: 7 },
  ];

  const abrirModal = (tipo: 'frota' | 'individual') => {
    setTipoRastreamento(tipo);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setTipoRastreamento(null);
    setFormData({
      nomeCliente: '',
      cpfCnpj: '',
      email: '',
      telefone: '',
      placas: [''],
      nomeEmpresa: '',
      numeroVeiculos: '',
    });
  };

  const adicionarPlaca = () => {
    setFormData({ ...formData, placas: [...formData.placas, ''] });
  };

  const removerPlaca = (index: number) => {
    const novasPlacas = formData.placas.filter((_, i) => i !== index);
    setFormData({ ...formData, placas: novasPlacas });
  };

  const atualizarPlaca = (index: number, valor: string) => {
    const novasPlacas = [...formData.placas];
    novasPlacas[index] = valor;
    setFormData({ ...formData, placas: novasPlacas });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados do formulário:', formData);
    fecharModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Rastreamento de Multas</h2>
          <p className="text-sm text-gray-600 mt-2">Gerencie todas as multas rastreadas da sua frota</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => abrirModal('frota')}
          className="bg-white rounded-lg shadow-md p-8 border-2 border-gray-200 hover:border-[#1E3A8A] transition-all cursor-pointer group"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-[#1E3A8A] transition-colors">
              <i className="ri-truck-line text-4xl text-[#1E3A8A] group-hover:text-white"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Rastreamento de Frotas</h3>
              <p className="text-sm text-gray-600 mt-2">Para empresas com múltiplos veículos</p>
              <p className="text-xs text-gray-500 mt-1">A partir de 3 veículos - R$ 50/placa (Gratuito) | R$ 25/placa (Premium)</p>
            </div>
            <button className="px-6 py-3 bg-[#10B981] text-white rounded-lg font-medium hover:bg-green-600 transition-colors whitespace-nowrap">
              <i className="ri-add-line mr-2"></i>
              Cadastrar Frota
            </button>
          </div>
        </div>

        <div
          onClick={() => abrirModal('individual')}
          className="bg-white rounded-lg shadow-md p-8 border-2 border-gray-200 hover:border-[#10B981] transition-all cursor-pointer group"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-[#10B981] transition-colors">
              <i className="ri-user-line text-4xl text-[#10B981] group-hover:text-white"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Rastreamento Individual</h3>
              <p className="text-sm text-gray-600 mt-2">Para pessoas físicas ou veículos individuais</p>
              <p className="text-xs text-gray-500 mt-1">R$ 60 por veículo (Gratuito) | R$ 30 por veículo (Premium)</p>
            </div>
            <button className="px-6 py-3 bg-[#10B981] text-white rounded-lg font-medium hover:bg-green-600 transition-colors whitespace-nowrap">
              <i className="ri-add-line mr-2"></i>
              Cadastrar Individual
            </button>
          </div>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {tipoRastreamento === 'frota' ? 'Cadastrar Rastreamento de Frota' : 'Cadastrar Rastreamento Individual'}
              </h3>
              <button
                onClick={fecharModal}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {tipoRastreamento === 'frota' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nomeEmpresa}
                    onChange={(e) => setFormData({ ...formData, nomeEmpresa: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="Digite o nome da empresa"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {tipoRastreamento === 'frota' ? 'Nome do Responsável *' : 'Nome Completo *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.nomeCliente}
                  onChange={(e) => setFormData({ ...formData, nomeCliente: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {tipoRastreamento === 'frota' ? 'CNPJ *' : 'CPF *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.cpfCnpj}
                  onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  placeholder={tipoRastreamento === 'frota' ? '00.000.000/0000-00' : '000.000.000-00'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              {tipoRastreamento === 'frota' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número de Veículos *
                  </label>
                  <input
                    type="number"
                    required
                    min="3"
                    value={formData.numeroVeiculos}
                    onChange={(e) => setFormData({ ...formData, numeroVeiculos: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="Mínimo 3 veículos"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Placas dos Veículos *
                  </label>
                  <button
                    type="button"
                    onClick={adicionarPlaca}
                    className="text-sm text-[#10B981] font-medium hover:underline cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-add-line mr-1"></i>
                    Adicionar Placa
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.placas.map((placa, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        required
                        value={placa}
                        onChange={(e) => atualizarPlaca(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                        placeholder="ABC-1234"
                      />
                      {formData.placas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerPlaca(index)}
                          className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <i className="ri-delete-bin-line text-lg"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-check-line mr-2"></i>
                  Cadastrar Rastreamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar por placa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] cursor-pointer"
          >
            <option value="todos">Todos os Status</option>
            <option value="suspensiva">Suspensiva</option>
            <option value="analise">Em Análise</option>
            <option value="concluido">Concluído</option>
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] cursor-pointer"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="5169">5169 - Dirigir sob efeito de substância</option>
            <option value="7579">7579 - Forçar passagem entre veículos</option>
            <option value="5797">5797 - Estacionamento irregular</option>
            <option value="5274">5274 - Manobras perigosas</option>
            <option value="5240">5240 - Disputar corrida (racha)</option>
            <option value="5266">5266 - Competição sem permissão</option>
            <option value="5290">5290 - Não adotar providências de segurança</option>
            <option value="7617">7617 - Interromper circulação da via</option>
            <option value="7471">7471 - Excesso de velocidade acima de 50%</option>
            <option value="5029">5029 - Dirigir com CNH cassada</option>
          </select>

          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-filter-3-line mr-2"></i>
            Mais Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-red-50 rounded-lg border-l-4 border-[#EF4444]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspensivas</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">3</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-alert-line text-2xl text-[#EF4444]"></i>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-[#F59E0B]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Análise</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">4</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <i className="ri-time-line text-2xl text-[#F59E0B]"></i>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-[#10B981]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">3</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-2xl text-[#10B981]"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Placa</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo de Multa</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Valor</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pontos</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {multas.map((multa) => (
                <tr key={multa.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{multa.placa.substring(0, 3)}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{multa.placa}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">{multa.tipo}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${multa.status === 'suspensiva' ? 'bg-red-100 text-[#EF4444]' :
                      multa.status === 'analise' ? 'bg-yellow-100 text-[#F59E0B]' :
                        'bg-green-100 text-[#10B981]'
                      }`}>
                      {multa.status === 'suspensiva' ? 'Suspensiva' :
                        multa.status === 'analise' ? 'Em Análise' :
                          'Concluído'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">{multa.data}</td>
                  <td className="py-4 px-4 text-sm font-semibold text-gray-800">{multa.valor}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                      {multa.pontos} pts
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap">
                        <i className="ri-file-text-line mr-1"></i>
                        Criar Recurso
                      </button>
                      <button className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                        <i className="ri-money-dollar-circle-line mr-1"></i>
                        Pagar Multa
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#1E3A8A] transition-colors cursor-pointer">
                        <i className="ri-eye-line text-lg"></i>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#1E3A8A] transition-colors cursor-pointer">
                        <i className="ri-more-2-fill text-lg"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">Mostrando 10 de 1.247 multas</p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
              Anterior
            </button>
            <button className="px-3 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-medium cursor-pointer">1</button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">2</button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">3</button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}