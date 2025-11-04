import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import "./CalendarPopup.css";

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
  valor_parcela: number | string;
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

  const formatarValor = (valor: number | string): string => {
    let valorNumerico: number;
    
    if (typeof valor === 'string') {
      valorNumerico = parseFloat(valor);
    } else {
      valorNumerico = valor;
    }
    
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
        `https://capital-online-tcc.onrender.com/api/lembretes/?mes=${mes}&ano=${ano}`,
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
        `https://capital-online-tcc.onrender.com/api/lembretes/${lembreteId}/marcar_pago/`,
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
    <div className="calendar-overlay" onClick={onClose}>
      <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="calendar-close-btn">
          <X size={20} />
        </button>

        <div className="calendar-header-section">
          <h2 className="calendar-title">📅 Calendário de Lembretes</h2>
          <p className="calendar-subtitle">Acompanhe suas parcelas e lembretes de pagamento</p>
        </div>

        {loading && (
          <div className="calendar-loading">
            Carregando lembretes...
          </div>
        )}

        <div className="calendar-navigation">
          <button onClick={previousMonth} className="calendar-nav-btn">
            <ChevronLeft size={20} />
          </button>
          
          <h3 className="calendar-month-year">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <button onClick={nextMonth} className="calendar-nav-btn">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="calendar-content">
          <div className="calendar-days-header">
            {dayNames.map(name => (
              <div key={name} className="calendar-day-name">
                {name}
              </div>
            ))}
          </div>

          <div className="calendar-days-grid">
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
                  className={`calendar-day-cell ${!dayInfo.isCurrentMonth ? 'calendar-day-other-month' : ''} ${dayInfo.day && isToday(dayInfo.day) ? 'calendar-day-today' : ''} ${hasLembretes ? 'calendar-day-clickable' : ''}`}
                >
                  {dayInfo.day && (
                    <>
                      <div className={`calendar-day-number ${isToday(dayInfo.day) ? 'calendar-day-number-today' : ''}`}>
                        {dayInfo.day}
                      </div>
                      
                      {hasLembretes && (
                        <div className="calendar-day-reminders">
                          {dayLembretes.slice(0, 2).map((lembrete, i) => (
                            <div
                              key={i}
                              className={`calendar-reminder-badge ${lembrete.pago ? 'calendar-reminder-paid' : 'calendar-reminder-pending'}`}
                            >
                              {lembrete.pago ? "✓" : "💰"} {lembrete.numero_parcela}/{lembrete.total_parcelas}
                            </div>
                          ))}
                          {dayLembretes.length > 2 && (
                            <div className="calendar-reminder-more">
                              +{dayLembretes.length - 2}
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
          <div className="calendar-selected-details">
            <div className="calendar-selected-header">
              <h4 className="calendar-selected-title">
                Lembretes de {getBrasiliaDate(selectedDate).toLocaleDateString('pt-BR')}
              </h4>
              <button onClick={() => setSelectedDate(null)} className="calendar-selected-close">
                Fechar
              </button>
            </div>
            
            {selectedLembretes.map((lembrete) => (
              <div key={lembrete.id} className={`calendar-reminder-card ${lembrete.pago ? 'calendar-reminder-card-paid' : 'calendar-reminder-card-pending'}`}>
                <div className="calendar-reminder-card-content">
                  <div className="calendar-reminder-info">
                    <h5 className="calendar-reminder-title">{lembrete.titulo}</h5>
                    <p className="calendar-reminder-description">{lembrete.descricao}</p>
                    <div className="calendar-reminder-value">
                      R$ {formatarValor(lembrete.valor_parcela)}
                    </div>
                  </div>
                  
                  {!lembrete.pago ? (
                    <button onClick={() => marcarPago(lembrete.id)} className="calendar-pay-btn">
                      <Check size={16} /> Pagar
                    </button>
                  ) : (
                    <div className="calendar-paid-badge">
                      <Check size={16} /> Pago
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="calendar-stats">
          <div className="calendar-stat-item">
            <div className="calendar-stat-value calendar-stat-pending">
              {lembretes.filter(l => !l.pago).length}
            </div>
            <div className="calendar-stat-label">Pendentes</div>
          </div>
          <div className="calendar-stat-item">
            <div className="calendar-stat-value calendar-stat-paid">
              {lembretes.filter(l => l.pago).length}
            </div>
            <div className="calendar-stat-label">Pagos</div>
          </div>
          <div className="calendar-stat-item">
            <div className="calendar-stat-value calendar-stat-total">
              {lembretes.length}
            </div>
            <div className="calendar-stat-label">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarInternal;