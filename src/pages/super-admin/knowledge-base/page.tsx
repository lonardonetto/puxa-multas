import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Brain, Plus, Trash2, Edit, Search, FileText, CheckCircle, Clock, XCircle, Check, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecursoConhecimento {
  id: string;
  codigo_infracao: string;
  tipo_recurso: string;
  conteudo: string;
  argumentos_chave: string[] | null;
  detran_estado: string | null;
  resultado: string | null;
  data_deferimento: string | null;
  is_global: boolean | null;
  observacoes: string | null;
  created_at: string | null;
  status_aprovacao: string | null;
  recurso_origem_id: string | null;
  organization_id: string | null;
}

const TIPOS_RECURSO = [
  { value: 'defesa_previa', label: 'Defesa Prévia' },
  { value: 'jari', label: 'JARI' },
  { value: 'cetran', label: 'CETRAN' },
];

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function KnowledgeBasePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pendentes' | 'aprovados'>('pendentes');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingRecurso, setViewingRecurso] = useState<RecursoConhecimento | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    codigo_infracao: '',
    tipo_recurso: 'defesa_previa',
    conteudo: '',
    argumentos_chave: '',
    detran_estado: '',
    resultado: 'deferido',
    data_deferimento: '',
    observacoes: '',
    is_global: true,
  });

  // Fetch recursos conhecimento
  const { data: recursos, isLoading } = useQuery({
    queryKey: ['recursos-conhecimento'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recursos_conhecimento')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RecursoConhecimento[];
    },
  });

  // Aprovar/Rejeitar mutation
  const aprovarMutation = useMutation({
    mutationFn: async ({ id, status, is_global }: { id: string; status: 'aprovado' | 'rejeitado'; is_global?: boolean }) => {
      const payload: any = { status_aprovacao: status };
      if (status === 'aprovado' && is_global !== undefined) {
        payload.is_global = is_global;
      }
      const { error } = await supabase
        .from('recursos_conhecimento')
        .update(payload)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recursos-conhecimento'] });
      toast.success(variables.status === 'aprovado' ? 'Recurso aprovado e adicionado à base!' : 'Recurso rejeitado');
    },
    onError: (error) => {
      toast.error('Erro: ' + error.message);
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        codigo_infracao: data.codigo_infracao,
        tipo_recurso: data.tipo_recurso,
        conteudo: data.conteudo,
        argumentos_chave: data.argumentos_chave ? data.argumentos_chave.split(',').map(a => a.trim()) : null,
        detran_estado: data.detran_estado || null,
        resultado: data.resultado,
        data_deferimento: data.data_deferimento || null,
        observacoes: data.observacoes || null,
        is_global: data.is_global,
        status_aprovacao: 'aprovado', // Quando super admin adiciona manualmente, já vai aprovado
      };

      if (data.id) {
        const { error } = await supabase
          .from('recursos_conhecimento')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('recursos_conhecimento')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recursos-conhecimento'] });
      toast.success(editingId ? 'Recurso atualizado!' : 'Recurso adicionado à base!');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Erro ao salvar: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recursos_conhecimento')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recursos-conhecimento'] });
      toast.success('Recurso removido da base!');
    },
    onError: (error) => {
      toast.error('Erro ao remover: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      codigo_infracao: '',
      tipo_recurso: 'defesa_previa',
      conteudo: '',
      argumentos_chave: '',
      detran_estado: '',
      resultado: 'deferido',
      data_deferimento: '',
      observacoes: '',
      is_global: true,
    });
    setEditingId(null);
  };

  const handleEdit = (recurso: RecursoConhecimento) => {
    setFormData({
      codigo_infracao: recurso.codigo_infracao,
      tipo_recurso: recurso.tipo_recurso,
      conteudo: recurso.conteudo,
      argumentos_chave: recurso.argumentos_chave?.join(', ') || '',
      detran_estado: recurso.detran_estado || '',
      resultado: recurso.resultado || 'deferido',
      data_deferimento: recurso.data_deferimento || '',
      observacoes: recurso.observacoes || '',
      is_global: recurso.is_global ?? true,
    });
    setEditingId(recurso.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo_infracao || !formData.conteudo) {
      toast.error('Preencha o código da infração e o conteúdo');
      return;
    }
    saveMutation.mutate(editingId ? { ...formData, id: editingId } : formData);
  };

  // Separar recursos por status
  const recursosPendentes = recursos?.filter(r => r.status_aprovacao === 'pendente' || !r.status_aprovacao) || [];
  const recursosAprovados = recursos?.filter(r => r.status_aprovacao === 'aprovado') || [];

  // Filter recursos baseado na aba ativa
  const currentList = activeTab === 'pendentes' ? recursosPendentes : recursosAprovados;
  
  const filteredRecursos = currentList.filter(r => {
    const matchesSearch = searchTerm === '' ||
      r.codigo_infracao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.conteudo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'all' || r.tipo_recurso === filterTipo;
    const matchesEstado = filterEstado === 'all' || r.detran_estado === filterEstado;
    return matchesSearch && matchesTipo && matchesEstado;
  });

  const stats = {
    pendentes: recursosPendentes.length,
    aprovados: recursosAprovados.length,
    total: recursos?.length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Base de Conhecimento IA</h1>
            <p className="text-muted-foreground">
              Analise recursos deferidos pelos clientes e aprove para treinar a IA
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Manual
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                {editingId ? 'Editar Recurso' : 'Adicionar Recurso à Base'}
              </DialogTitle>
              <DialogDescription>
                Adicione recursos deferidos para que a IA aprenda padrões de sucesso
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código da Infração *</Label>
                  <Input
                    placeholder="Ex: 74550, 50100"
                    value={formData.codigo_infracao}
                    onChange={(e) => setFormData({ ...formData, codigo_infracao: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Recurso</Label>
                  <Select
                    value={formData.tipo_recurso}
                    onValueChange={(v) => setFormData({ ...formData, tipo_recurso: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_RECURSO.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>DETRAN/Estado</Label>
                  <Select
                    value={formData.detran_estado}
                    onValueChange={(v) => setFormData({ ...formData, detran_estado: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nacional (todos)</SelectItem>
                      {ESTADOS.map(e => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data do Deferimento</Label>
                  <Input
                    type="date"
                    value={formData.data_deferimento}
                    onChange={(e) => setFormData({ ...formData, data_deferimento: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Argumentos-Chave (separados por vírgula)</Label>
                <Input
                  placeholder="Ex: erro de preenchimento, ausência de foto, local incorreto"
                  value={formData.argumentos_chave}
                  onChange={(e) => setFormData({ ...formData, argumentos_chave: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Liste os principais argumentos que levaram ao deferimento
                </p>
              </div>

              <div className="space-y-2">
                <Label>Conteúdo do Recurso Deferido *</Label>
                <Textarea
                  placeholder="Cole aqui o texto completo do recurso que foi deferido..."
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Este conteúdo será usado pela IA como referência para gerar novos recursos
                </p>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Anotações adicionais sobre este recurso..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveMutation.isPending} className="bg-purple-600 hover:bg-purple-700">
                  {saveMutation.isPending ? 'Salvando...' : editingId ? 'Atualizar' : 'Adicionar à Base'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`border-2 cursor-pointer transition-all ${activeTab === 'pendentes' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-transparent hover:border-orange-300'}`}
          onClick={() => setActiveTab('pendentes')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.pendentes}</p>
                <p className="text-xs text-muted-foreground">Pendentes de Análise</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`border-2 cursor-pointer transition-all ${activeTab === 'aprovados' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-transparent hover:border-green-300'}`}
          onClick={() => setActiveTab('aprovados')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.aprovados}</p>
                <p className="text-xs text-muted-foreground">Aprovados na Base</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Geral</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="h-6 w-6 text-purple-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">Fluxo Automático de Recursos Deferidos</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Quando um cliente marca um recurso como <strong>"Deferido"</strong>, ele é automaticamente enviado para esta área de análise.
                Você pode revisar o conteúdo, adicionar argumentos-chave e aprovar para que a IA use como referência.
                Apenas recursos <strong>aprovados</strong> são utilizados pela IA para gerar novas defesas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código ou conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de Recurso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {TIPOS_RECURSO.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos estados</SelectItem>
                {ESTADOS.map(e => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {activeTab === 'pendentes' ? (
              <>
                <Clock className="h-5 w-5 text-orange-600" />
                Recursos Pendentes de Aprovação ({filteredRecursos.length})
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Recursos Aprovados na Base ({filteredRecursos.length})
              </>
            )}
          </CardTitle>
          <CardDescription>
            {activeTab === 'pendentes' 
              ? 'Recursos deferidos pelos clientes aguardando sua análise'
              : 'Recursos que a IA usa como referência para gerar defesas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredRecursos.length === 0 ? (
            <div className="text-center py-12">
              {activeTab === 'pendentes' ? (
                <>
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold text-lg mb-1">Nenhum recurso pendente</h3>
                  <p className="text-muted-foreground">
                    Recursos deferidos pelos clientes aparecerão aqui automaticamente
                  </p>
                </>
              ) : (
                <>
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold text-lg mb-1">Base de conhecimento vazia</h3>
                  <p className="text-muted-foreground mb-4">
                    Aprove recursos pendentes ou adicione manualmente
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Manualmente
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código Infração</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Argumentos</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecursos.map((recurso) => (
                  <TableRow key={recurso.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {recurso.codigo_infracao}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        recurso.tipo_recurso === 'defesa_previa' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        recurso.tipo_recurso === 'jari' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }>
                        {TIPOS_RECURSO.find(t => t.value === recurso.tipo_recurso)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {recurso.detran_estado || <span className="text-muted-foreground">Nacional</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {recurso.argumentos_chave?.slice(0, 2).map((arg, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {arg}
                          </Badge>
                        ))}
                        {(recurso.argumentos_chave?.length || 0) > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(recurso.argumentos_chave?.length || 0) - 2}
                          </Badge>
                        )}
                        {!recurso.argumentos_chave?.length && (
                          <span className="text-xs text-muted-foreground italic">Sem argumentos</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {recurso.created_at ? format(new Date(recurso.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {/* Visualizar */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setViewingRecurso(recurso)}
                          title="Visualizar conteúdo"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {activeTab === 'pendentes' ? (
                          <>
                            {/* Aprovar */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => aprovarMutation.mutate({ id: recurso.id, status: 'aprovado', is_global: true })}
                              disabled={aprovarMutation.isPending}
                              title="Aprovar e adicionar à base global"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            {/* Rejeitar */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (confirm('Rejeitar este recurso? Ele não será usado pela IA.')) {
                                  aprovarMutation.mutate({ id: recurso.id, status: 'rejeitado' });
                                }
                              }}
                              disabled={aprovarMutation.isPending}
                              title="Rejeitar"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            {/* Editar */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(recurso)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {/* Remover */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                if (confirm('Remover este recurso da base?')) {
                                  deleteMutation.mutate(recurso.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Visualização */}
      <Dialog open={!!viewingRecurso} onOpenChange={(open) => !open && setViewingRecurso(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Visualizar Recurso - {viewingRecurso?.codigo_infracao}
            </DialogTitle>
            <DialogDescription>
              {TIPOS_RECURSO.find(t => t.value === viewingRecurso?.tipo_recurso)?.label} | 
              Estado: {viewingRecurso?.detran_estado || 'Nacional'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Conteúdo do Recurso:</h4>
              <pre className="whitespace-pre-wrap text-sm font-mono bg-background p-4 rounded border max-h-[400px] overflow-y-auto">
                {viewingRecurso?.conteudo}
              </pre>
            </div>

            {viewingRecurso?.argumentos_chave?.length ? (
              <div>
                <h4 className="font-semibold mb-2">Argumentos-Chave:</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingRecurso.argumentos_chave.map((arg, i) => (
                    <Badge key={i} variant="secondary">{arg}</Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {viewingRecurso?.observacoes && (
              <div>
                <h4 className="font-semibold mb-2">Observações:</h4>
                <p className="text-muted-foreground">{viewingRecurso.observacoes}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            {viewingRecurso?.status_aprovacao === 'pendente' && (
              <>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    aprovarMutation.mutate({ id: viewingRecurso.id, status: 'rejeitado' });
                    setViewingRecurso(null);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    aprovarMutation.mutate({ id: viewingRecurso.id, status: 'aprovado', is_global: true });
                    setViewingRecurso(null);
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Aprovar para Base Global
                </Button>
              </>
            )}
            {viewingRecurso?.status_aprovacao !== 'pendente' && (
              <Button variant="outline" onClick={() => setViewingRecurso(null)}>
                Fechar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
