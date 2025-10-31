import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";

export interface CalendarInternalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

interface Lembrete {
  id: number;
  titulo: string;
  descricao: string;
  data_vencimento: string;
  valor_parcela: number | string; // Pode vir como number ou string
  numero_parcela: number;
  total_parcelas: number;
  pago: boolean;
  movimentacao: number;
}

const CalendarInternal: React.FC<CalendarInternalProps> = ({ isOpen, onClose, userEmail }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const getBrasiliaDate = (dateStr?: string) => {
    if (dateStr) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  };

  // Função para formatar valor em reais
  const formatarValor = (valor: number | string): string => {
    let valorNumerico: number;
    
    if (typeof valor === 'string') {
      // Se veio como string, tentar converter
      valorNumerico = parseFloat(valor);
    } else {
      valorNumerico = valor;
    }
    
    // Se o valor for maior que 1000, assumir que está em centavos
    if (valorNumerico >= 1000) {
      valorNumerico = valorNumerico / 100;
    }
    
    return valorNumerico.toFixed(2).replace('.', ',');
  };

  useEffect(() => {
    if (isOpen) {
      fetchLembretes();
    }
  }, [isOpen, currentDate]);

  const fetchLembretes = async () => {
    setLoading(true);
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const mes = currentDate.getMonth() + 1;
      const ano = currentDate.getFullYear();
      
      console.log(`🔍 Buscando lembretes para ${mes}/${ano}`);
      
      const response = await fetch(
        `http://127.0.0.1:8000/api/lembretes/?mes=${mes}&ano=${ano}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const lembretesData = Array.isArray(data) ? data : data.results || [];
        console.log(`✅ ${lembretesData.length} lembretes encontrados:`, lembretesData);
        setLembretes(lembretesData);
      } else {
        console.error('❌ Erro ao buscar lembretes:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar lembretes:', error);
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
        console.log(`✅ Lembrete ${lembreteId} marcado como pago`);
        fetchLembretes();
      } else {
        console.error(`❌ Erro ao marcar lembrete ${lembreteId} como pago`);
      }
    } catch (error) {
      console.error('❌ Erro ao marcar como pago:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    
    return days;
  };

  const getLembretesForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return lembretes.filter(l => l.data_vencimento === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (day: number) => {
    const today = getBrasiliaDate();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  if (!isOpen) return null;

  const days = getDaysInMonth(currentDate);
  const selectedLembretes = selectedDate ? lembretes.filter(l => l.data_vencimento === selectedDate) : [];

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
          maxWidth: "900px",
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

        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          📅 Calendário de Lembretes
        </h2>
        <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
          Acompanhe suas parcelas e lembretes de pagamento
        </p>

        {loading && (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>
            Carregando lembretes...
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <button
            onClick={previousMonth}
            style={{
              padding: "0.5rem",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronLeft size={20} />
          </button>
          
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <button
            onClick={nextMonth}
            style={{
              padding: "0.5rem",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem", marginBottom: "0.5rem" }}>
            {dayNames.map(name => (
              <div
                key={name}
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: "0.875rem",
                  color: "#64748b",
                  padding: "0.5rem",
                }}
              >
                {name}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
            {days.map((dayInfo, index) => {
              const dayLembretes = dayInfo.day ? getLembretesForDay(dayInfo.day) : [];
              const hasLembretes = dayLembretes.length > 0;
              const dateStr = dayInfo.day ? 
                `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayInfo.day).padStart(2, '0')}` : 
                null;
              
              return (
                <div
                  key={index}
                  onClick={() => dateStr && hasLembretes && setSelectedDate(dateStr)}
                  style={{
                    minHeight: "80px",
                    padding: "0.5rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    backgroundColor: !dayInfo.isCurrentMonth ? "#f8fafc" : 
                                   dayInfo.day && isToday(dayInfo.day) ? "#dbeafe" : 
                                   "white",
                    cursor: hasLembretes ? "pointer" : "default",
                    position: "relative",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => hasLembretes && (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseLeave={(e) => hasLembretes && (e.currentTarget.style.transform = "scale(1)")}
                >
                  {dayInfo.day && (
                    <>
                      <div style={{ 
                        fontWeight: isToday(dayInfo.day) ? "700" : "500",
                        fontSize: "0.875rem",
                        color: !dayInfo.isCurrentMonth ? "#94a3b8" : "#1e293b",
                        marginBottom: "0.25rem"
                      }}>
                        {dayInfo.day}
                      </div>
                      
                      {hasLembretes && (
                        <div style={{ fontSize: "0.75rem" }}>
                          {dayLembretes.slice(0, 2).map((lembrete, i) => (
                            <div
                              key={i}
                              style={{
                                padding: "0.125rem 0.25rem",
                                marginBottom: "0.125rem",
                                backgroundColor: lembrete.pago ? "#dcfce7" : "#fef3c7",
                                borderRadius: "3px",
                                fontSize: "0.625rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {lembrete.pago ? "✓" : "💰"} {lembrete.numero_parcela}/{lembrete.total_parcelas}
                            </div>
                          ))}
                          {dayLembretes.length > 2 && (
                            <div style={{ fontSize: "0.625rem", color: "#64748b", marginTop: "0.125rem" }}>
                              +{dayLembretes.length - 2} mais
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selectedDate && selectedLembretes.length > 0 && (
          <div style={{
            marginTop: "1.5rem",
            padding: "1rem",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h4 style={{ fontWeight: "600", fontSize: "1rem" }}>
                Lembretes de {getBrasiliaDate(selectedDate).toLocaleDateString('pt-BR')}
              </h4>
              <button
                onClick={() => setSelectedDate(null)}
                style={{
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Fechar
              </button>
            </div>
            
            {selectedLembretes.map((lembrete) => (
              <div
                key={lembrete.id}
                style={{
                  padding: "1rem",
                  marginBottom: "0.75rem",
                  backgroundColor: "white",
                  borderRadius: "6px",
                  border: lembrete.pago ? "2px solid #22c55e" : "2px solid #eab308",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                      {lembrete.titulo}
                    </h5>
                    <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.5rem" }}>
                      {lembrete.descricao}
                    </p>
                    <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#059669" }}>
                      R$ {formatarValor(lembrete.valor_parcela)}
                    </div>
                  </div>
                  
                  {!lembrete.pago ? (
                    <button
                      onClick={() => marcarPago(lembrete.id)}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#22c55e",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Check size={16} /> Pagar
                    </button>
                  ) : (
                    <div style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#dcfce7",
                      color: "#166534",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}>
                      <Check size={16} /> Pago
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{
          marginTop: "1.5rem",
          padding: "1rem",
          backgroundColor: "#f0f9ff",
          borderRadius: "8px",
          display: "flex",
          gap: "2rem",
          justifyContent: "center",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#0284c7" }}>
              {lembretes.filter(l => !l.pago).length}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Pendentes</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#22c55e" }}>
              {lembretes.filter(l => l.pago).length}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Pagos</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#6366f1" }}>
              {lembretes.length}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Total</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarInternal;