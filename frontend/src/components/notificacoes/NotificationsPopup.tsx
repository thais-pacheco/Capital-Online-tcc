import React, { useState, useEffect } from "react";
import { X, Bell, AlertCircle, Clock, CheckCircle, Trash2 } from "lucide-react";

export interface NotificationsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Lembrete {
  id: number;
  titulo: string;
  descricao: string;
  data_vencimento: string;
  valor_parcela: string;
  numero_parcela: number;
  total_parcelas: number;
  pago: boolean;
  movimentacao: number;
  notificado: boolean;
}

interface NotificacaoAgrupada {
  tipo: 'vencido' | 'hoje' | 'proximo';
  lembretes: Lembrete[];
  titulo: string;
  cor: string;
  icone: React.ReactNode;
}

const NotificationsPopup: React.FC<NotificationsPopupProps> = ({ isOpen, onClose }) => {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotificacoes();
    }
  }, [isOpen]);

  const getBrasiliaDate = (dateStr?: string) => {
    if (dateStr) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  const fetchNotificacoes = async () => {
    setLoading(true);
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    if (!token) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/lembretes/notificacoes/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLembretes(Array.isArray(data) ? data : data.results || []);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarPago = async (lembreteId: number) => {
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    if (!token) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/lembretes/${lembreteId}/marcar_pago/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        fetchNotificacoes();
      }
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
    }
  };

  const dispensarNotificacao = async (lembreteId: number) => {
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    if (!token) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/lembretes/${lembreteId}/marcar_notificado/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        fetchNotificacoes();
      }
    } catch (error) {
      console.error('Erro ao dispensar notificação:', error);
    }
  };

  const agruparNotificacoes = (): NotificacaoAgrupada[] => {
    const hoje = getBrasiliaDate();
    const grupos: NotificacaoAgrupada[] = [];

    const vencidos = lembretes.filter(l => {
      const dataVencimento = getBrasiliaDate(l.data_vencimento);
      return dataVencimento < hoje && !l.pago;
    });

    const hojeVence = lembretes.filter(l => {
      const dataVencimento = getBrasiliaDate(l.data_vencimento);
      return dataVencimento.getTime() === hoje.getTime() && !l.pago;
    });

    const proximos = lembretes.filter(l => {
      const dataVencimento = getBrasiliaDate(l.data_vencimento);
      const diasRestantes = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      return diasRestantes > 0 && diasRestantes <= 7 && !l.pago;
    });

    if (vencidos.length > 0) {
      grupos.push({
        tipo: 'vencido',
        lembretes: vencidos,
        titulo: `${vencidos.length} pagamento${vencidos.length > 1 ? 's' : ''} vencido${vencidos.length > 1 ? 's' : ''}`,
        cor: '#dc2626',
        icone: <AlertCircle size={20} />
      });
    }

    if (hojeVence.length > 0) {
      grupos.push({
        tipo: 'hoje',
        lembretes: hojeVence,
        titulo: `${hojeVence.length} pagamento${hojeVence.length > 1 ? 's' : ''} vence${hojeVence.length > 1 ? 'm' : ''} hoje`,
        cor: '#ea580c',
        icone: <Clock size={20} />
      });
    }

    if (proximos.length > 0) {
      grupos.push({
        tipo: 'proximo',
        lembretes: proximos,
        titulo: `${proximos.length} pagamento${proximos.length > 1 ? 's' : ''} próximo${proximos.length > 1 ? 's' : ''}`,
        cor: '#0891b2',
        icone: <Bell size={20} />
      });
    }

    return grupos;
  };

  const getDiasRestantes = (dataVencimento: string) => {
    const hoje = getBrasiliaDate();
    const vencimento = getBrasiliaDate(dataVencimento);
    const dias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dias < 0) return `Vencido há ${Math.abs(dias)} dia${Math.abs(dias) > 1 ? 's' : ''}`;
    if (dias === 0) return 'Vence hoje';
    if (dias === 1) return 'Vence amanhã';
    return `Vence em ${dias} dias`;
  };

  if (!isOpen) return null;

  const grupos = agruparNotificacoes();
  const totalNotificacoes = lembretes.filter(l => !l.pago).length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "2rem",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <Bell size={24} color="#0891b2" />
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            Notificações
          </h2>
        </div>

        <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
          {totalNotificacoes > 0 
            ? `Você tem ${totalNotificacoes} lembrete${totalNotificacoes > 1 ? 's' : ''} pendente${totalNotificacoes > 1 ? 's' : ''}`
            : 'Nenhuma notificação pendente'}
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            Carregando notificações...
          </div>
        ) : grupos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
          }}>
            <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '1rem', color: '#475569', fontWeight: '500' }}>
              Você está em dia! 
            </p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
              Não há pagamentos pendentes ou próximos do vencimento.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {grupos.map((grupo, idx) => (
              <div key={idx}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                  color: grupo.cor,
                  fontWeight: '600',
                  fontSize: '0.95rem',
                }}>
                  {grupo.icone}
                  <span>{grupo.titulo}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {grupo.lembretes.map((lembrete) => (
                    <div
                      key={lembrete.id}
                      style={{
                        padding: '1rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: `2px solid ${grupo.tipo === 'vencido' ? '#fecaca' : grupo.tipo === 'hoje' ? '#fed7aa' : '#bae6fd'}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                            {lembrete.titulo}
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                            Parcela {lembrete.numero_parcela}/{lembrete.total_parcelas} • {getBrasiliaDate(lembrete.data_vencimento).toLocaleDateString('pt-BR')}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1rem', fontWeight: '700', color: grupo.cor }}>
                              R$ {(Number(lembrete.valor_parcela) / 100).toFixed(2).replace('.', ',')}
                            </span>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: grupo.cor,
                              padding: '0.25rem 0.5rem',
                              backgroundColor: grupo.tipo === 'vencido' ? '#fee2e2' : grupo.tipo === 'hoje' ? '#ffedd5' : '#e0f2fe',
                              borderRadius: '4px',
                            }}>
                              {getDiasRestantes(lembrete.data_vencimento)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button
                          onClick={() => marcarPago(lembrete.id)}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            backgroundColor: '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                          }}
                        >
                          ✓ Marcar como pago
                        </button>
                        <button
                          onClick={() => dispensarNotificacao(lembrete.id)}
                          title="Dispensar notificação"
                          style={{
                            padding: '0.5rem 0.75rem',
                            backgroundColor: 'white',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPopup;