import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { useSystemSettings } from '../../hooks/useSystemSettings';

interface Props {
  plan: any;
  billingCycle: 'mensal' | 'anual';
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalContratarPlano({ plan, billingCycle, onClose, onSuccess }: Props) {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const { settings } = useSystemSettings();
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const valor = billingCycle === 'anual' && plan.preco_anual > 0 ? plan.preco_anual : plan.preco_mensal;
  const valorFormatado = Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Pega chave PIX das configurações do sistema
  const chavePix = settings?.find((s: any) => s.key === 'pix_key')?.value || 'central@centraldamulta.app.br';
  const nomePix = settings?.find((s: any) => s.key === 'pix_name')?.value || 'Central da Multa';

  const copiarChave = () => {
    navigator.clipboard.writeText(chavePix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleSolicitar = async () => {
    if (!currentOrganization || !user) return;
    setEnviando(true);
    try {
      // Cria solicitação de plano
      const { error } = await (supabase as any).from('solicitacoes_plano').insert({
        organization_id: currentOrganization.id,
        user_id: user.id,
        plano_id: plan.id,
        plano_slug: plan.slug,
        plano_nome: plan.nome,
        ciclo: billingCycle,
        valor,
        status: 'pendente',
      });

      if (error) throw error;

      // Notificação no sino para o Super Admin
      try {
        await (supabase as any).from('notificacoes_recarga').insert({
          organization_id: currentOrganization.id,
          solicitacao_id: '00000000-0000-0000-0000-000000000000', // placeholder — será atualizado
          tipo: 'plano_pendente',
          titulo: `Nova solicitação de plano: ${plan.nome}`,
          mensagem: `${currentOrganization.nome} solicitou o plano ${plan.nome} (${billingCycle}) por R$ ${valorFormatado}.`,
          valor,
          para_super_admin: true,
        });
      } catch (_) {}

      // Envia email para o Super Admin e para o usuário
      try {
        await supabase.functions.invoke('enviar-email', {
          body: {
            tipo: 'plano_solicitado',
            destinatario_email: user.email,
            destinatario_nome: (user as any).nome || user.email,
            dados: {
              plano_nome: plan.nome,
              ciclo: billingCycle,
              valor,
              organizacao: currentOrganization.nome,
              chave_pix: chavePix,
            },
          },
        });
      } catch (_) {}

      toast.success('Solicitação enviada! Aguarde a aprovação do administrador.');
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Contratar Plano {plan.nome}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Ciclo {billingCycle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <i className="ri-close-line text-xl text-muted-foreground"></i>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Valor */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Valor a pagar</p>
            <p className="text-3xl font-bold text-primary">R$ {valorFormatado}</p>
            <p className="text-xs text-muted-foreground mt-1">/{billingCycle}</p>
          </div>

          {/* Instruções PIX */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <i className="ri-qr-code-line text-primary"></i>
              Pague via PIX
            </h3>

            <div className="bg-muted rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium">CHAVE PIX</p>
                <div className="flex items-center gap-2">
                  <span className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground break-all">
                    {chavePix}
                  </span>
                  <button
                    onClick={copiarChave}
                    className="flex-shrink-0 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                  >
                    {copiado ? <i className="ri-check-line"></i> : <i className="ri-file-copy-line"></i>}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium">BENEFICIÁRIO</p>
                <p className="text-sm font-semibold text-foreground">{nomePix}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium">VALOR EXATO</p>
                <p className="text-sm font-bold text-foreground">R$ {valorFormatado}</p>
              </div>
            </div>
          </div>

          {/* Aviso */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
            <i className="ri-information-line text-amber-600 flex-shrink-0 mt-0.5"></i>
            <p className="text-xs text-amber-700">
              Após realizar o pagamento, clique em <strong>"Confirmar Envio"</strong>. O administrador irá verificar e ativar seu plano em até 24h. O valor <strong>não entra como crédito</strong> — ele ativa os benefícios do plano escolhido.
            </p>
          </div>

          {/* Botão confirmar */}
          <button
            onClick={handleSolicitar}
            disabled={enviando}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {enviando ? (
              <><i className="ri-loader-4-line animate-spin"></i> Enviando...</>
            ) : (
              <><i className="ri-check-line"></i> Confirmar Solicitação de Plano</>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Após enviar, guarde o comprovante PIX caso seja solicitado.
          </p>
        </div>
      </div>
    </div>
  );
}
