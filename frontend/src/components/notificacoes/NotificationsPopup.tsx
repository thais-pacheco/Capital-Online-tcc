import React, { useState, useEffect, useRef } from 'react';
import { X, Bell, AlertCircle, Clock, DollarSign, Calendar } from 'lucide-react';
import './NotificationsPopup.css';

interface Notification {
  id: number;
  titulo: string;
  valor: number;
  dataVencimento: string;
  diasRestantes: number;
  tipo: 'vencendo' | 'vencida' | 'proxima';
  parcela?: string;
}

interface NotificationsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPopup: React.FC<NotificationsPopupProps> = ({ isOpen, onClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      fetchNotifications();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/transacoes/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar notificações');
      }

      const data = await response.json();
      
      // Filtrar apenas transações com parcelas (múltiplas) e que são saídas
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const notificationsList: Notification[] = data
        .filter((t: any) => {
          // Verificar se tem parcelas e é uma saída
          return t.tipo === 'saida' && t.parcelas && parseInt(t.parcelas) > 1;
        })
        .map((t: any) => {
          const dataVencimento = new Date(t.data);
          const diffTime = dataVencimento.getTime() - today.getTime();
          const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let tipo: 'vencendo' | 'vencida' | 'proxima' = 'proxima';
          if (diasRestantes < 0) {
            tipo = 'vencida';
          } else if (diasRestantes <= 7) {
            tipo = 'vencendo';
          }

          return {
            id: t.id,
            titulo: t.titulo || 'Sem título',
            valor: Math.abs(Number(t.valor)),
            dataVencimento: t.data,
            diasRestantes,
            tipo,
            parcela: t.parcelas ? `1/${t.parcelas}` : undefined
          };
        })
        .filter((n: Notification) => n.diasRestantes <= 30) // Mostrar apenas próximos 30 dias
        .sort((a: Notification, b: Notification) => a.diasRestantes - b.diasRestantes);

      setNotifications(notificationsList);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'vencida':
        return <AlertCircle size={20} className="notification-icon-alert" />;
      case 'vencendo':
        return <Clock size={20} className="notification-icon-warning" />;
      default:
        return <Calendar size={20} className="notification-icon-info" />;
    }
  };

  const getNotificationClass = (tipo: string) => {
    switch (tipo) {
      case 'vencida':
        return 'notification-item-alert';
      case 'vencendo':
        return 'notification-item-warning';
      default:
        return 'notification-item-info';
    }
  };

  const getStatusText = (diasRestantes: number) => {
    if (diasRestantes < 0) {
      return `Vencida há ${Math.abs(diasRestantes)} dia(s)`;
    } else if (diasRestantes === 0) {
      return 'Vence hoje!';
    } else if (diasRestantes === 1) {
      return 'Vence amanhã';
    } else if (diasRestantes <= 7) {
      return `Vence em ${diasRestantes} dias`;
    } else {
      return `Vence em ${diasRestantes} dias`;
    }
  };

  const unreadCount = notifications.filter(n => n.tipo !== 'proxima').length;

  return (
    <div className="notifications-overlay">
      <div className="notifications-popup" ref={popupRef}>
        <div className="notifications-header">
          <div className="notifications-header-content">
            <Bell size={24} />
            <div>
              <h2>Notificações</h2>
              {unreadCount > 0 && (
                <span className="notifications-badge">{unreadCount} pendente(s)</span>
              )}
            </div>
          </div>
          <button className="notifications-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="notifications-body">
          {loading ? (
            <div className="notifications-loading">
              <div className="loading-spinner"></div>
              <p>Carregando notificações...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notifications-empty">
              <Bell size={48} />
              <p>Nenhuma notificação</p>
              <small>Você não tem contas a vencer nos próximos dias</small>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${getNotificationClass(notification.tipo)}`}
                >
                  <div className="notification-icon-wrapper">
                    {getNotificationIcon(notification.tipo)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.titulo}
                      {notification.parcela && (
                        <span className="notification-parcela">Parcela {notification.parcela}</span>
                      )}
                    </div>
                    <div className="notification-details">
                      <span className="notification-value">
                        <DollarSign size={14} />
                        R$ {(notification.valor / 100).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <span className="notification-separator">•</span>
                      <span className="notification-date">
                        {new Date(notification.dataVencimento).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="notification-status">
                      {getStatusText(notification.diasRestantes)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="notifications-footer">
          <p className="notifications-footer-text">
            Notificações baseadas em contas parceladas cadastradas
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPopup;