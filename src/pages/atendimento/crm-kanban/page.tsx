'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientes } from '@/hooks/useClientes';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { CRMStatus } from '@/types/database';

// Fallback default stages in case the hook fails
const FALLBACK_STAGES = [
  { id: 'novo', nome: 'novo', label: 'Novos Leads', color: 'text-blue-600', bgColor: 'bg-blue-600', borderColor: 'border-blue-200', icon: 'ri-flashlight-line' },
  { id: 'negociacao', nome: 'negociacao', label: 'Em Negociação', color: 'text-amber-600', bgColor: 'bg-amber-600', borderColor: 'border-amber-200', icon: 'ri-shake-hands-line' },
  { id: 'followup', nome: 'followup', label: 'Follow-up', color: 'text-purple-600', bgColor: 'bg-purple-600', borderColor: 'border-purple-200', icon: 'ri-chat-history-line' },
  { id: 'fechado', nome: 'fechado', label: 'Fechado/Ganho', color: 'text-emerald-600', bgColor: 'bg-emerald-600', borderColor: 'border-emerald-200', icon: 'ri-trophy-line' },
  { id: 'perdido', nome: 'perdido', label: 'Perdido', color: 'text-gray-500', bgColor: 'bg-gray-600', borderColor: 'border-gray-300', icon: 'ri-close-circle-line' }
];

export default function CRMKanban() {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const { clientes, loading: loadingClientes, updateCliente, createCliente, deleteCliente, fetchClientesByOrganization } = useClientes();

  // Stages are managed via state now
  const loadingStages = false;

  const [clienteIdSelecionado, setClienteIdSelecionado] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [showModalNovoLead, setShowModalNovoLead] = useState(false);
  const [showModalEditarLead, setShowModalEditarLead] = useState<string | null>(null);
  const [showModalGerenciarColunas, setShowModalGerenciarColunas] = useState(false);
  const [novoNomeStage, setNovoNomeStage] = useState('');
  const [editandoStageId, setEditandoStageId] = useState<string | null>(null);
  const [isSavingStage, setIsSavingStage] = useState(false);
  const [customStages, setCustomStages] = useState(FALLBACK_STAGES);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  // Opções de cores disponíveis
  const COLOR_OPTIONS = [
    { name: 'Azul', bgColor: 'bg-blue-600', color: 'text-blue-600', borderColor: 'border-blue-200' },
    { name: 'Verde', bgColor: 'bg-emerald-600', color: 'text-emerald-600', borderColor: 'border-emerald-200' },
    { name: 'Amarelo', bgColor: 'bg-amber-600', color: 'text-amber-600', borderColor: 'border-amber-200' },
    { name: 'Roxo', bgColor: 'bg-purple-600', color: 'text-purple-600', borderColor: 'border-purple-200' },
    { name: 'Rosa', bgColor: 'bg-pink-600', color: 'text-pink-600', borderColor: 'border-pink-200' },
    { name: 'Vermelho', bgColor: 'bg-red-600', color: 'text-red-600', borderColor: 'border-red-200' },
    { name: 'Laranja', bgColor: 'bg-orange-600', color: 'text-orange-600', borderColor: 'border-orange-200' },
    { name: 'Cinza', bgColor: 'bg-gray-600', color: 'text-gray-500', borderColor: 'border-gray-300' },
    { name: 'Ciano', bgColor: 'bg-cyan-600', color: 'text-cyan-600', borderColor: 'border-cyan-200' },
    { name: 'Índigo', bgColor: 'bg-indigo-600', color: 'text-indigo-600', borderColor: 'border-indigo-200' },
  ];

  // Stub functions for stage management (simplified - no database persistence for now)
  const saveStage = async (nome: string, id?: string, colorOption?: typeof COLOR_OPTIONS[0]) => {
    if (id) {
      setCustomStages(prev => prev.map(s => {
        if (s.id === id) {
          return {
            ...s,
            nome,
            label: nome,
            ...(colorOption && {
              bgColor: colorOption.bgColor,
              color: colorOption.color,
              borderColor: colorOption.borderColor
            })
          };
        }
        return s;
      }));
    } else {
      const defaultColor = colorOption || COLOR_OPTIONS[0];
      const newStage = {
        id: `custom-${Date.now()}`,
        nome: nome,
        label: nome,
        color: defaultColor.color,
        bgColor: defaultColor.bgColor,
        borderColor: defaultColor.borderColor,
        icon: 'ri-flashlight-line'
      };
      setCustomStages(prev => [...prev, newStage]);
    }
    return true;
  };

  const updateStageColor = (id: string, colorOption: typeof COLOR_OPTIONS[0]) => {
    setCustomStages(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          bgColor: colorOption.bgColor,
          color: colorOption.color,
          borderColor: colorOption.borderColor
        };
      }
      return s;
    }));
    setShowColorPicker(null);
  };

  const deleteStage = async (id: string) => {
    setCustomStages(prev => prev.filter(s => s.id !== id));
    return true;
  };

  const initializeDefaults = async () => {
    setCustomStages(FALLBACK_STAGES);
  };

  // Origens customizáveis
  const [customOrigins, setCustomOrigins] = useState([
    'Edital', 'Orgânico', 'Indicação', 'Instagram', 'Google', 'Website', 'Telefone'
  ]);
  const [showModalOrigens, setShowModalOrigens] = useState(false);
  const [novaOrigem, setNovaOrigem] = useState('');
  const [editandoOrigemIndex, setEditandoOrigemIndex] = useState<number | null>(null);

  const addOrigem = () => {
    if (novaOrigem.trim() && !customOrigins.includes(novaOrigem.trim())) {
      setCustomOrigins(prev => [...prev, novaOrigem.trim()]);
      setNovaOrigem('');
    }
  };

  const updateOrigem = (index: number, newValue: string) => {
    setCustomOrigins(prev => prev.map((o, i) => i === index ? newValue : o));
    setEditandoOrigemIndex(null);
  };

  const deleteOrigem = (index: number) => {
    setCustomOrigins(prev => prev.filter((_, i) => i !== index));
  };

  // Tipos de serviço customizáveis
  const [customServicos, setCustomServicos] = useState([
    'Rastreamento', 'Recurso', 'Suspensão', 'Defesa Prévia'
  ]);
  const [showModalServicos, setShowModalServicos] = useState(false);
  const [novoServico, setNovoServico] = useState('');
  const [editandoServicoIndex, setEditandoServicoIndex] = useState<number | null>(null);

  const addServico = () => {
    if (novoServico.trim() && !customServicos.includes(novoServico.trim())) {
      setCustomServicos(prev => [...prev, novoServico.trim()]);
      setNovoServico('');
    }
  };

  const updateServico = (index: number, newValue: string) => {
    setCustomServicos(prev => prev.map((s, i) => i === index ? newValue : s));
    setEditandoServicoIndex(null);
  };

  const deleteServico = (index: number) => {
    setCustomServicos(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchClientesByOrganization(currentOrganization.id);
    }
  }, [currentOrganization?.id, fetchClientesByOrganization]);

  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    celular: '',
    crm_valor: 0,
    crm_origem: 'Edital',
    crm_tipo: 'rastreamento' as 'rastreamento' | 'recurso',
    crm_infracao: '',
    crm_status: '',
    descricao: '' // Campo de descrição adicionado
  });

  // Atualiza o status padrão do formulário quando os estágios carregarem
  useEffect(() => {
    if (customStages.length > 0 && !formData.crm_status) {
      setFormData(prev => ({ ...prev, crm_status: customStages[0].nome }));
    }
  }, [customStages, formData.crm_status]);

  const kanbanColumns = useMemo(() => {
    return customStages.map(stage => ({
      ...stage,
      leads: clientes.filter(c => c.crm_status === stage.nome)
    }));
  }, [customStages, clientes]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('clienteId', id);
    setIsDragging(id);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('clienteId');
    setIsDragging(null);
    if (id) await updateCliente(id, { crm_status: newStatus } as any);
  };

  const totalValue = clientes.reduce((acc, c) => acc + Number(c.crm_valor || 0), 0);
  const totalLeads = clientes.length;

  const countBySource = useMemo(() => {
    return clientes.reduce((acc, c) => {
      const source = c.crm_origem || 'Outros';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [clientes]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization?.id || !user?.id) return;
    await createCliente({
      ...formData,
      user_id: user.id,
      organization_id: currentOrganization.id,
      tipo_pessoa: 'fisica',
      ativo: true
    } as any);
    setShowModalNovoLead(false);
    resetForm();
  };

  const handleEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showModalEditarLead) return;
    await updateCliente(showModalEditarLead, formData as any);
    setShowModalEditarLead(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome_completo: '',
      email: '',
      celular: '',
      crm_valor: 0,
      crm_origem: customOrigins[0] || 'Edital',
      crm_tipo: 'rastreamento',
      crm_infracao: '',
      crm_status: customStages[0]?.nome || '',
      descricao: ''
    });
  };

  const openEditModal = (lead: any) => {
    setFormData({
      nome_completo: lead.nome_completo,
      email: lead.email || '',
      celular: lead.celular || '',
      crm_valor: Number(lead.crm_valor) || 0,
      crm_origem: lead.crm_origem || customOrigins[0] || 'Edital',
      crm_tipo: lead.crm_tipo || 'rastreamento',
      crm_infracao: lead.crm_infracao || '',
      crm_status: lead.crm_status || (customStages[0]?.nome || ''),
      descricao: lead.descricao || ''
    });
    setShowModalEditarLead(lead.id);
  };

  const handleDeleteLead = async (id: string, name: string) => {
    if (confirm(`Excluir lead "${name}"?`)) await deleteCliente(id);
  };

  const handleSaveStage = async () => {
    if (!novoNomeStage.trim()) return;
    setIsSavingStage(true);
    const success = await saveStage(novoNomeStage, editandoStageId || undefined);
    if (success) {
      setNovoNomeStage('');
      setEditandoStageId(null);
    }
    setIsSavingStage(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Profissional */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CRM Kanban</h2>
          <p className="text-sm text-gray-500">Gestão de leads e funil de vendas</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModalGerenciarColunas(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <i className="ri-settings-4-line"></i>
            Gerenciar Colunas
          </button>
          <button
            onClick={() => { resetForm(); setShowModalNovoLead(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <i className="ri-add-line"></i>
            Novo Lead
          </button>
        </div>
      </div>

      {/* Indicadores por Origem - Dinâmico */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {customOrigins.slice(0, 6).map((origem, idx) => {
          const colorPalette = [
            { color: 'border-blue-500', icBg: 'bg-blue-50', icCol: 'text-blue-600', icon: 'ri-folder-open-line' },
            { color: 'border-emerald-500', icBg: 'bg-emerald-50', icCol: 'text-emerald-600', icon: 'ri-flashlight-line' },
            { color: 'border-purple-500', icBg: 'bg-purple-50', icCol: 'text-purple-600', icon: 'ri-heart-line' },
            { color: 'border-pink-500', icBg: 'bg-pink-50', icCol: 'text-pink-600', icon: 'ri-instagram-line' },
            { color: 'border-amber-500', icBg: 'bg-amber-50', icCol: 'text-amber-600', icon: 'ri-global-line' },
            { color: 'border-cyan-500', icBg: 'bg-cyan-50', icCol: 'text-cyan-600', icon: 'ri-phone-line' },
          ];
          const palette = colorPalette[idx % colorPalette.length];
          const count = countBySource[origem] || 0;

          return (
            <div key={idx} className={`p-4 bg-white rounded-lg shadow-sm border-l-4 ${palette.color} flex items-center justify-between`}>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate max-w-[100px]" title={origem}>{origem}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
              </div>
              <div className={`w-10 h-10 ${palette.icBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <i className={`${palette.icon} text-lg ${palette.icCol}`}></i>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo Financeiro Profissional */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'VALOR EM FUNIL', value: totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: 'ri-money-dollar-circle-line', textCol: 'text-emerald-600' },
          { label: 'TOTAL DE LEADS', value: totalLeads, icon: 'ri-user-smile-line', textCol: 'text-blue-600' },
          { label: 'TICKET MÉDIO', value: (totalLeads > 0 ? totalValue / totalLeads : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: 'ri-line-chart-line', textCol: 'text-amber-600' },
          { label: 'STATUS', value: 'ATIVO', icon: 'ri-shield-check-line', textCol: 'text-purple-600' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
              <i className={`${item.icon} text-sm ${item.textCol} opacity-50`}></i>
            </div>
            <p className="text-lg font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Funil de Vendas Title */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-800">Funil de Vendas</h3>
      </div>

      {/* Quadro Kanban Profissional (Clean) */}
      <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar min-h-[600px]">
        {loadingStages ? (
          <div className="w-full flex items-center justify-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <div className="flex flex-col items-center gap-2">
              <i className="ri-loader-4-line text-3xl text-blue-600 animate-spin"></i>
              <p className="text-sm font-medium text-gray-500">Carregando painel...</p>
            </div>
          </div>
        ) : kanbanColumns.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="ri-layout-view text-3xl text-gray-400"></i>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800">Nenhuma coluna configurada</p>
              <p className="text-sm text-gray-500 mt-1">Initialize as colunas padrão para começar a gerenciar seus leads.</p>
            </div>
            <button
              onClick={initializeDefaults}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-all"
            >
              Inicializar Colunas Padrão
            </button>
          </div>
        ) : (
          kanbanColumns.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 flex flex-col gap-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.nome)}
            >
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 group/header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${column.bgColor}`}></div>
                    {editandoStageId === column.id ? (
                      <input
                        type="text"
                        value={novoNomeStage}
                        onChange={(e) => setNovoNomeStage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            saveStage(novoNomeStage, column.id);
                            setEditandoStageId(null);
                            setNovoNomeStage('');
                          } else if (e.key === 'Escape') {
                            setEditandoStageId(null);
                            setNovoNomeStage('');
                          }
                        }}
                        onBlur={() => {
                          if (novoNomeStage.trim()) {
                            saveStage(novoNomeStage, column.id);
                          }
                          setEditandoStageId(null);
                          setNovoNomeStage('');
                        }}
                        autoFocus
                        className="text-xs font-bold uppercase text-gray-700 tracking-wider bg-blue-50 border border-blue-300 rounded px-2 py-1 outline-none w-full"
                      />
                    ) : (
                      <h3 className="text-xs font-bold uppercase text-gray-700 tracking-wider truncate" title={column.label}>{column.label}</h3>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5 opacity-0 group-hover/header:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditandoStageId(column.id);
                          setNovoNomeStage(column.label);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar nome"
                      >
                        <i className="ri-edit-2-line text-xs"></i>
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setShowColorPicker(showColorPicker === column.id ? null : column.id)}
                          className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Mudar cor"
                        >
                          <i className="ri-palette-line text-xs"></i>
                        </button>
                        {showColorPicker === column.id && (
                          <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 w-40">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-2 px-1">Escolher Cor</p>
                            <div className="grid grid-cols-5 gap-1">
                              {COLOR_OPTIONS.map((colorOpt) => (
                                <button
                                  key={colorOpt.name}
                                  onClick={() => updateStageColor(column.id, colorOpt)}
                                  className={`w-6 h-6 rounded-full ${colorOpt.bgColor} hover:ring-2 hover:ring-offset-1 hover:ring-gray-400 transition-all`}
                                  title={colorOpt.name}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir a coluna "${column.label}"?`)) {
                            deleteStage(column.id);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Excluir coluna"
                      >
                        <i className="ri-delete-bin-line text-xs"></i>
                      </button>
                    </div>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600 ml-1">
                      {column.leads.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`flex-1 flex flex-col gap-3 rounded-lg transition-colors ${isDragging ? 'bg-blue-50/50 border-2 border-dashed border-blue-200' : ''}`}>
                {column.leads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className={`w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing group ${isDragging === lead.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{lead.nome_completo}</h4>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                            {lead.crm_tipo || 'Rastreamento'}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                            {lead.crm_origem || 'Edital'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(lead); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                          <i className="ri-edit-2-line text-xs"></i>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id, lead.nome_completo); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <i className="ri-delete-bin-line text-xs"></i>
                        </button>
                      </div>
                    </div>

                    {/* Informações de contato */}
                    <div className="space-y-1 mb-3 text-[11px] text-gray-500">
                      {lead.email && (
                        <div className="flex items-center gap-1.5 truncate">
                          <i className="ri-mail-line text-gray-400"></i>
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}
                      {lead.celular && (
                        <div className="flex items-center gap-1.5">
                          <i className="ri-phone-line text-gray-400"></i>
                          <span>{lead.celular}</span>
                        </div>
                      )}
                      {lead.descricao && (
                        <div className="flex items-start gap-1.5 mt-1.5">
                          <i className="ri-file-text-line text-gray-400 mt-0.5"></i>
                          <span className="text-gray-600 leading-tight line-clamp-2">
                            {lead.descricao.length > 60 ? lead.descricao.substring(0, 60) + '...' : lead.descricao}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">
                        {Number(lead.crm_valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      <button onClick={() => setClienteIdSelecionado(lead.id)} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider">
                        Ver Ficha
                      </button>
                    </div>
                  </div>
                ))}
                {column.leads.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-10">
                    <i className="ri-inbox-line text-2xl mb-2"></i>
                    <p className="text-[10px] font-bold uppercase">Sem Leads</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Card para adicionar nova coluna */}
        {!loadingStages && (
          <div className="flex-shrink-0 w-80 flex flex-col gap-4">
            {showModalGerenciarColunas ? (
              <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-dashed border-blue-300">
                <input
                  type="text"
                  value={novoNomeStage}
                  onChange={(e) => setNovoNomeStage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && novoNomeStage.trim()) {
                      saveStage(novoNomeStage);
                      setNovoNomeStage('');
                      setShowModalGerenciarColunas(false);
                    } else if (e.key === 'Escape') {
                      setNovoNomeStage('');
                      setShowModalGerenciarColunas(false);
                    }
                  }}
                  placeholder="Nome da nova coluna..."
                  autoFocus
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (novoNomeStage.trim()) {
                        saveStage(novoNomeStage);
                        setNovoNomeStage('');
                        setShowModalGerenciarColunas(false);
                      }
                    }}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all"
                  >
                    Criar Coluna
                  </button>
                  <button
                    onClick={() => {
                      setNovoNomeStage('');
                      setShowModalGerenciarColunas(false);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowModalGerenciarColunas(true)}
                className="w-full h-20 bg-gray-50 hover:bg-blue-50 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg flex items-center justify-center gap-2 text-gray-400 hover:text-blue-600 transition-all"
              >
                <i className="ri-add-line text-xl"></i>
                <span className="text-sm font-semibold">Nova Coluna</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal Gerenciar Colunas */}
      {showModalGerenciarColunas && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[500] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Gerenciar Colunas</h3>
                <p className="text-xs text-gray-500 mt-0.5">Customize as etapas do seu funil</p>
              </div>
              <button onClick={() => { setShowModalGerenciarColunas(false); setEditandoStageId(null); setNovoNomeStage(''); }} className="text-gray-400 hover:text-gray-900 transition-colors p-2">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Adicionar/Editar Stage */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  {editandoStageId ? 'Editar Nome da Coluna' : 'Nova Coluna'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={novoNomeStage}
                    onChange={(e) => setNovoNomeStage(e.target.value)}
                    placeholder="Ex: Aguardando Retorno"
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all text-sm font-medium"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveStage()}
                  />
                  <button
                    onClick={handleSaveStage}
                    disabled={isSavingStage || !novoNomeStage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isSavingStage ? <i className="ri-loader-4-line animate-spin"></i> : <i className={editandoStageId ? 'ri-save-line' : 'ri-add-line'}></i>}
                    {editandoStageId ? 'Salvar' : 'Add'}
                  </button>
                </div>
                {editandoStageId && (
                  <button onClick={() => { setEditandoStageId(null); setNovoNomeStage(''); }} className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase">
                    Cancelar Edição
                  </button>
                )}
              </div>

              {/* Lista de Stages */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Colunas Atuais</label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {customStages.map((stage) => (
                    <div key={stage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${stage.bgColor}`}></div>
                        <span className="text-sm font-bold text-gray-700">{stage.label}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditandoStageId(stage.id); setNovoNomeStage(stage.label); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <i className="ri-edit-2-line text-xs"></i>
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Excluir a coluna "${stage.label}"?`)) {
                              await deleteStage(stage.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <i className="ri-delete-bin-line text-xs"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  {customStages.length === 0 && !loadingStages && (
                    <p className="text-center py-4 text-xs text-gray-400 italic">Nenhuma coluna personalizada.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-right">
              <button
                onClick={() => setShowModalGerenciarColunas(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-300 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modais Profissionais (Estilo Lista de Clientes) */}
      {(showModalNovoLead || showModalEditarLead) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[500] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{showModalEditarLead ? 'Editar Lead' : 'Novo Lead'}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Informe os dados básicos da negociação</p>
              </div>
              <button onClick={() => { setShowModalNovoLead(false); setShowModalEditarLead(null); }} className="text-gray-400 hover:text-gray-900 transition-colors p-2">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form onSubmit={showModalEditarLead ? handleEditLead : handleCreateLead} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Nome Completo</label>
                  <input required type="text" value={formData.nome_completo} onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all text-sm font-medium text-gray-800" placeholder="Ex: Leonardo Netto Pereira" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">E-mail</label>
                    <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all text-sm font-medium text-gray-800" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">WhatsApp</label>
                    <input required type="text" value={formData.celular} onChange={(e) => setFormData({ ...formData, celular: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all text-sm font-medium text-gray-800" placeholder="(00) 00000-0000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Valor</label>
                    <input type="number" value={formData.crm_valor} onChange={(e) => setFormData({ ...formData, crm_valor: Number(e.target.value) })} className="w-full px-4 py-2 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all text-sm font-bold text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Origem</label>
                      <button
                        type="button"
                        onClick={() => setShowModalOrigens(true)}
                        className="text-[9px] font-bold text-blue-600 hover:text-blue-800 uppercase"
                      >
                        <i className="ri-settings-3-line mr-0.5"></i>Gerenciar
                      </button>
                    </div>
                    <select value={formData.crm_origem} onChange={(e) => setFormData({ ...formData, crm_origem: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all text-sm font-medium text-gray-800">
                      {customOrigins.map((origem, idx) => (
                        <option key={idx} value={origem}>{origem.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tipo de Serviço</label>
                      <button
                        type="button"
                        onClick={() => setShowModalServicos(true)}
                        className="text-[9px] font-bold text-blue-600 hover:text-blue-800 uppercase"
                      >
                        <i className="ri-settings-3-line mr-0.5"></i>Gerenciar
                      </button>
                    </div>
                    <select
                      value={formData.crm_tipo}
                      onChange={(e) => setFormData({ ...formData, crm_tipo: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all text-sm font-medium text-gray-800"
                    >
                      {customServicos.map((servico, idx) => (
                        <option key={idx} value={servico}>{servico.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Descrição</label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all text-sm font-medium text-gray-800 resize-none"
                      placeholder="Descrição do lead, notas adicionais..."
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Coluna (Etapa)</label>
                    <select value={formData.crm_status} onChange={(e) => setFormData({ ...formData, crm_status: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all text-sm font-medium text-gray-800">
                      {customStages.map(s => (
                        <option key={s.id} value={s.nome}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowModalNovoLead(false); setShowModalEditarLead(null); }} className="flex-1 py-2 text-xs font-bold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all uppercase tracking-widest">Cancelar</button>
                  <button type="submit" className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all uppercase tracking-widest">Salvar Lead</button>
                </div>

                {/* Botão Transformar em Cliente - só aparece ao editar */}
                {showModalEditarLead && (
                  <div className="pt-3 border-t border-gray-100 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        const leadData = clientes.find(c => c.id === showModalEditarLead);
                        if (leadData) {
                          setShowModalEditarLead(null);
                          navigate('/cadastro/novo-cliente', {
                            state: {
                              leadData: {
                                nome_completo: leadData.nome_completo,
                                email: leadData.email,
                                celular: leadData.celular,
                              }
                            }
                          });
                        }
                      }}
                      className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg hover:from-emerald-600 hover:to-green-700 shadow-sm transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <i className="ri-user-add-line"></i>
                      Transformar Lead em Cliente
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-1.5">
                      Abre o formulário de cadastro completo com os dados pré-preenchidos
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pasta do Cliente Profissional */}
      {clienteIdSelecionado && clientes.find(c => c.id === clienteIdSelecionado) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{clientes.find(c => c.id === clienteIdSelecionado)?.nome_completo}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Pasta do Cliente • CRM</p>
              </div>
              <button onClick={() => setClienteIdSelecionado(null)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <i className="ri-user-line text-blue-600"></i>
                    Informações Gerais
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: 'E-mail', value: clientes.find(c => c.id === clienteIdSelecionado)?.email },
                      { label: 'WhatsApp', value: clientes.find(c => c.id === clienteIdSelecionado)?.celular },
                      { label: 'Origem', value: clientes.find(c => c.id === clienteIdSelecionado)?.crm_origem },
                      { label: 'Tipo', value: clientes.find(c => c.id === clienteIdSelecionado)?.crm_tipo },
                      { label: 'Coluna Atual', value: customStages.find(s => s.nome === clientes.find(c => c.id === clienteIdSelecionado)?.crm_status)?.label || clientes.find(c => c.id === clienteIdSelecionado)?.crm_status }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value || 'Não informado'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-600 p-8 rounded-xl text-white shadow-lg flex flex-col justify-between h-56">
                  <div>
                    <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Valor da Negociação</p>
                    <p className="text-3xl font-bold mt-2 tracking-tight">
                      {Number(clientes.find(c => c.id === clienteIdSelecionado)?.crm_valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { openEditModal(clientes.find(c => c.id === clienteIdSelecionado)); setClienteIdSelecionado(null); }} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold uppercase backdrop-blur-md transition-all">Editar Dados</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gerenciar Origens */}
      {showModalOrigens && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[600] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Gerenciar Origens</h3>
                <p className="text-xs text-gray-500 mt-0.5">Adicione, edite ou remova origens de leads</p>
              </div>
              <button onClick={() => { setShowModalOrigens(false); setNovaOrigem(''); setEditandoOrigemIndex(null); }} className="text-gray-400 hover:text-gray-900 transition-colors p-2">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Adicionar nova origem */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaOrigem}
                  onChange={(e) => setNovaOrigem(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addOrigem(); }}
                  placeholder="Nova origem..."
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all text-sm"
                />
                <button
                  onClick={addOrigem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-1"
                >
                  <i className="ri-add-line"></i>
                  Adicionar
                </button>
              </div>

              {/* Lista de origens */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {customOrigins.map((origem, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                    {editandoOrigemIndex === idx ? (
                      <input
                        type="text"
                        defaultValue={origem}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateOrigem(idx, (e.target as HTMLInputElement).value);
                          } else if (e.key === 'Escape') {
                            setEditandoOrigemIndex(null);
                          }
                        }}
                        onBlur={(e) => updateOrigem(idx, e.target.value)}
                        autoFocus
                        className="flex-1 px-2 py-1 text-sm bg-blue-50 border border-blue-300 rounded outline-none mr-2"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-800">{origem}</span>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditandoOrigemIndex(idx)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <i className="ri-edit-2-line text-xs"></i>
                      </button>
                      <button
                        onClick={() => {
                          if (customOrigins.length > 1) {
                            deleteOrigem(idx);
                          } else {
                            alert('Você deve ter pelo menos uma origem.');
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Excluir"
                      >
                        <i className="ri-delete-bin-line text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => { setShowModalOrigens(false); setNovaOrigem(''); setEditandoOrigemIndex(null); }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gerenciar Tipos de Serviço */}
      {showModalServicos && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[600] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Gerenciar Tipos de Serviço</h3>
                <p className="text-xs text-gray-500 mt-0.5">Adicione, edite ou remova tipos de serviço</p>
              </div>
              <button onClick={() => { setShowModalServicos(false); setNovoServico(''); setEditandoServicoIndex(null); }} className="text-gray-400 hover:text-gray-900 transition-colors p-2">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Adicionar novo tipo de serviço */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novoServico}
                  onChange={(e) => setNovoServico(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addServico(); }}
                  placeholder="Novo tipo de serviço..."
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all text-sm"
                />
                <button
                  onClick={addServico}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-1"
                >
                  <i className="ri-add-line"></i>
                  Adicionar
                </button>
              </div>

              {/* Lista de tipos de serviço */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {customServicos.map((servico, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                    {editandoServicoIndex === idx ? (
                      <input
                        type="text"
                        defaultValue={servico}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateServico(idx, (e.target as HTMLInputElement).value);
                          } else if (e.key === 'Escape') {
                            setEditandoServicoIndex(null);
                          }
                        }}
                        onBlur={(e) => updateServico(idx, e.target.value)}
                        autoFocus
                        className="flex-1 px-2 py-1 text-sm bg-blue-50 border border-blue-300 rounded outline-none mr-2"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-800">{servico}</span>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditandoServicoIndex(idx)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <i className="ri-edit-2-line text-xs"></i>
                      </button>
                      <button
                        onClick={() => {
                          if (customServicos.length > 1) {
                            deleteServico(idx);
                          } else {
                            alert('Você deve ter pelo menos um tipo de serviço.');
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Excluir"
                      >
                        <i className="ri-delete-bin-line text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => { setShowModalServicos(false); setNovoServico(''); setEditandoServicoIndex(null); }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
