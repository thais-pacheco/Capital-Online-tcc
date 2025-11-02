import React, { useState, useEffect } from 'react';
import { PiggyBank, Calendar, Bell, LogOut, User, CheckCircle, XCircle, Trash2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CalendarInternal from '../calendario/CalendarPopup';
import NotificationsPopup from '../notificacoes/NotificationsPopup';
import './newtransaction.css';

interface FormData {
  type: 'income' | 'expense';
  description: string;
  amount: string;
  category: string;
  date: string;
  observations: string;
  paymentType: 'avista' | 'parcelado';
  installments: string;
  addReminders: boolean;
  reminderDay: string;
}

interface Categoria {
  id: number;
  nome: string;
  tipo: 'entrada' | 'saida';
}

interface Toast {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

interface Transaction {
  id: number;
  descricao: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  data_movimentacao: string;
  categoria: number;
  observacoes?: string;
  forma_pagamento?: 'avista' | 'parcelado';
  quantidade_parcelas?: number;
}

interface DeleteModal {
  isOpen: boolean;
  transactionId: number | null;
  transactionName: string;
}

const NewTransaction: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    type: 'income',
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    observations: '',
    paymentType: 'avista',
    installments: '',
    addReminders: false,
    reminderDay: '5',
  });

  const [categories, setCategories] = useState<Categoria[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast>({ show: false, type: 'success', message: '' });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({
    isOpen: false,
    transactionId: null,
    transactionName: '',
  });
  const [deleting, setDeleting] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type, message: '' });
    }, 4000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserEmail(user.email || '');
      } catch (e) {
        console.error('Erro ao parse do usuário:', e);
      }
    }
  }, []);

  // Buscar transações
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    if (!token) return;

    try {
      const res = await fetch('https://capital-online-tcc.onrender.com/api/transacoes/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        // Ordenar por data (mais recentes primeiro)
        const sorted = data.sort((a: Transaction, b: Transaction) => {
          return new Date(b.data_movimentacao).getTime() - new Date(a.data_movimentacao).getTime();
        });
        setTransactions(sorted);
      }
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    if (!token) {
      showToast('error', 'Usuário não autenticado.');
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await fetch('https://capital-online-tcc.onrender.com/api/categorias/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          showToast('error', 'Sessão expirada. Faça login novamente.');
          return;
        }

        if (!res.ok) throw new Error('Erro ao carregar categorias');

        const data = await res.json();
        const results = Array.isArray(data) ? data : data.results || [];

        const filtered = results.filter((cat: Categoria) =>
          formData.type === 'income' ? cat.tipo === 'entrada' : cat.tipo === 'saida'
        );

        setCategories(filtered);
      } catch (err) {
        console.error(err);
        showToast('error', 'Erro ao carregar categorias.');
      }
    };

    fetchCategories();
  }, [formData.type]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'amount') {
      const apenasNumeros = value.replace(/\D/g, '');
      
      if (apenasNumeros === '') {
        setFormData(prev => ({ ...prev, [name]: '' }));
        return;
      }
      
      const valorNumerico = parseInt(apenasNumeros) / 100;
      const valorFormatado = valorNumerico.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      setFormData(prev => ({ ...prev, [name]: valorFormatado }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const createReminders = async (movimentacaoId: number) => {
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    if (!token) {
      console.error('❌ Token não encontrado');
      showToast('error', 'Usuário não autenticado.');
      return false;
    }

    if (!movimentacaoId) {
      console.error('❌ ID da movimentação inválido:', movimentacaoId);
      showToast('error', 'ID da movimentação não encontrado.');
      return false;
    }

    const storedUser = localStorage.getItem('usuario');
    let usuarioId = null;
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        usuarioId = user.id;
      } catch (e) {
        console.error('Erro ao parse do usuário:', e);
      }
    }

    if (!usuarioId) {
      console.error('❌ ID do usuário não encontrado');
      showToast('error', 'ID do usuário não encontrado.');
      return false;
    }

    console.log('🔄 Iniciando criação de lembretes...');

    try {
      const installments = parseInt(formData.installments);
      const reminderDay = parseInt(formData.reminderDay);
      const startDate = new Date(formData.date);
      
      // Converter valor para centavos (inteiro)
      const totalAmount = parseFloat(formData.amount.replace(/\./g, '').replace(',', '.')) * 100;
      // Calcular valor da parcela (arredondar para inteiro)
      const installmentValue = Math.round(totalAmount / installments);

      console.log(`📅 Criando ${installments} lembretes`);
      console.log(`💰 Valor total: ${totalAmount} centavos`);
      console.log(`💵 Valor por parcela: ${installmentValue} centavos`);

      const reminders = [];
      const errors = [];
      
      for (let i = 1; i <= installments; i++) {
        try {
          const dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, reminderDay);
          
          if (dueDate.getDate() !== reminderDay) {
            dueDate.setDate(0);
          }

          const year = dueDate.getFullYear();
          const month = String(dueDate.getMonth() + 1).padStart(2, '0');
          const day = String(dueDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;

          // Formatar valor da parcela com 2 casas decimais
          const valorParcelaFormatado = (installmentValue / 100).toFixed(2).replace('.', ',');

          const reminderPayload = {
            movimentacao: movimentacaoId,
            usuario: usuarioId,
            numero_parcela: i,
            total_parcelas: installments,
            valor_parcela: installmentValue, // Enviar como inteiro (centavos)
            data_vencimento: dateStr,
            titulo: `Parcela ${i}/${installments}: ${formData.description}`,
            descricao: `Valor da parcela: R$ ${valorParcelaFormatado}${formData.observations ? '\n' + formData.observations : ''}`,
            pago: false,
            notificado: false,
          };

          console.log(`📤 Enviando lembrete ${i}:`, reminderPayload);

          const response = await fetch('https://capital-online-tcc.onrender.com/api/lembretes/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(reminderPayload),
          });

          const responseText = await response.text();
          console.log(`📥 Resposta lembrete ${i}:`, responseText);

          if (!response.ok) {
            let errorData;
            try {
              errorData = JSON.parse(responseText);
            } catch (parseError) {
              errorData = { detail: responseText };
            }
            
            let errorMsg = '';
            if (typeof errorData === 'object') {
              if (errorData.detail) {
                errorMsg = errorData.detail;
              } else if (errorData.error) {
                errorMsg = errorData.error;
              } else {
                const firstKey = Object.keys(errorData)[0];
                if (firstKey && Array.isArray(errorData[firstKey])) {
                  errorMsg = `${firstKey}: ${errorData[firstKey][0]}`;
                } else if (firstKey) {
                  errorMsg = `${firstKey}: ${errorData[firstKey]}`;
                } else {
                  errorMsg = JSON.stringify(errorData);
                }
              }
            } else {
              errorMsg = String(errorData);
            }
            
            console.error(`❌ Erro na parcela ${i}:`, errorMsg);
            errors.push(`Parcela ${i}: ${errorMsg}`);
            continue;
          }

          const result = JSON.parse(responseText);
          console.log(`✅ Lembrete ${i} criado com sucesso:`, result);
          reminders.push(result);
        } catch (innerError: any) {
          console.error(`❌ Exceção na parcela ${i}:`, innerError);
          errors.push(`Parcela ${i}: ${innerError.message}`);
        }
      }

      if (errors.length > 0) {
        console.error('❌ Erros encontrados:', errors);
        showToast('error', `Alguns lembretes falharam: ${errors.join(', ')}`);
        return false;
      }

      console.log('✅ Todos os lembretes criados com sucesso!');
      return true;
    } catch (error: any) {
      console.error('❌ Erro geral ao criar lembretes:', error);
      showToast('error', `Erro ao criar lembretes: ${error.message}`);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token')?.replace(/"/g, '');
    if (!token) {
      showToast('error', 'Usuário não autenticado.');
      setLoading(false);
      return;
    }

    if (formData.paymentType === 'parcelado') {
      const parcelas = parseInt(formData.installments);
      if (!parcelas || parcelas < 2) {
        showToast('error', 'Para pagamento parcelado, informe no mínimo 2 parcelas.');
        setLoading(false);
        return;
      }

      const reminderDay = parseInt(formData.reminderDay);
      if (formData.addReminders && (reminderDay < 1 || reminderDay > 28)) {
        showToast('error', 'O dia do lembrete deve estar entre 1 e 28.');
        setLoading(false);
        return;
      }
    }

    const payload = {
      descricao: formData.description.trim(),
      tipo: formData.type === 'income' ? 'entrada' : 'saida',
      valor: parseFloat(formData.amount.replace(/\./g, '').replace(',', '.')) * 100,
      categoria: parseInt(formData.category),
      data_movimentacao: `${formData.date}T12:00:00`,
      observacoes: formData.observations.trim(),
      forma_pagamento: formData.paymentType,
      quantidade_parcelas: formData.paymentType === 'parcelado' ? parseInt(formData.installments) : null,
    };

    try {
      const response = await fetch('https://capital-online-tcc.onrender.com/api/transacoes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        showToast('error', 'Sessão expirada. Faça login novamente.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        
        let errorMsg = 'Erro ao salvar transação. ';
        if (error.quantidade_parcelas) {
          errorMsg += error.quantidade_parcelas[0];
        } else if (error.detail) {
          errorMsg += error.detail;
        } else {
          errorMsg += JSON.stringify(error);
        }
        
        showToast('error', errorMsg);
        setLoading(false);
      } else {
        const result = await response.json();
        console.log('✅ Transação criada:', result);
        
        if (formData.paymentType === 'parcelado' && formData.addReminders) {
          console.log('🔄 Iniciando criação de lembretes para movimentação ID:', result.id);
          const remindersSuccess = await createReminders(result.id);
          if (remindersSuccess) {
            showToast('success', `🎉 Movimentação salva! ${formData.installments} lembretes criados no calendário.`);
          } else {
            showToast('success', '✅ Movimentação salva! (Erro ao criar alguns lembretes)');
          }
        } else {
          showToast('success', '✅ Movimentação salva com sucesso!');
        }
        
        clearForm();
        fetchTransactions();
      }
    } catch (err) {
      console.error('❌ Erro ao salvar transação:', err);
      showToast('error', 'Erro ao conectar com o servidor. Verifique se a API está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: number, name: string) => {
    setDeleteModal({
      isOpen: true,
      transactionId: id,
      transactionName: name,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      transactionId: null,
      transactionName: '',
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.transactionId) return;

    setDeleting(true);
    const token = localStorage.getItem('token')?.replace(/"/g, '');

    if (!token) {
      showToast('error', 'Usuário não autenticado.');
      setDeleting(false);
      return;
    }

    try {
      const response = await fetch(`https://capital-online-tcc.onrender.com/api/transacoes/${deleteModal.transactionId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok || response.status === 204) {
        showToast('success', '✅ Transação excluída com sucesso!');
        fetchTransactions();
        closeDeleteModal();
      } else {
        const error = await response.json();
        showToast('error', error.detail || 'Erro ao excluir transação');
      }
    } catch (err) {
      showToast('error', 'Erro ao conectar com o servidor');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const clearForm = () => {
    setFormData({
      type: 'income',
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      observations: '',
      paymentType: 'avista',
      installments: '',
      addReminders: false,
      reminderDay: '5',
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'success' ? '#22c55e' : '#ef4444',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          {toast.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
          <span style={{ fontWeight: '600' }}>{toast.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={closeDeleteModal}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                padding: '0.75rem',
                display: 'flex',
              }}>
                <AlertCircle size={24} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                Confirmar Exclusão
              </h2>
            </div>

            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '1rem' }}>
              Tem certeza que deseja excluir a transação <strong>"{deleteModal.transactionName}"</strong>?
              Esta ação não pode ser desfeita.
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#64748b',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  backgroundColor: deleting ? '#fca5a5' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                {deleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <PiggyBank className="logo-icon" />
              <span className="logo-text">CAPITAL ONLINE</span>
            </div>
          </div>
          <nav className="nav">
            <button className="nav-button" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="nav-button active" onClick={() => navigate('/nova-movimentacao')}>Nova movimentação</button>
            <button className="nav-button" onClick={() => navigate('/graficos')}>Gráficos</button>
            <button className="nav-button" onClick={() => navigate('/objetivos')}>Objetivos</button>
          </nav>
          <div className="header-right">
            <button className="icon-button" onClick={() => setIsCalendarOpen(true)}>
              <Calendar size={18} />
            </button>
            <button className="icon-button" onClick={() => setIsNotificationsOpen(true)}>
              <Bell size={18} />
            </button>
            <div className="profile-avatar" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
              <User size={18} />
            </div>
            <button className="icon-button logout" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Nova movimentação
        </h1>
        
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          Registre uma nova entrada ou saída financeira
        </p>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <form onSubmit={handleSubmit}>
            {/* Tipo de movimentação */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem' }}>
                Tipo de movimentação
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    border: formData.type === 'income' ? '2px solid #22c55e' : '2px solid #e2e8f0',
                    borderRadius: '8px',
                    background: formData.type === 'income' ? '#f0fdf4' : 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    color: formData.type === 'income' ? '#22c55e' : '#64748b',
                  }}
                >
                  ↗ Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    border: formData.type === 'expense' ? '2px solid #ef4444' : '2px solid #e2e8f0',
                    borderRadius: '8px',
                    background: formData.type === 'expense' ? '#fef2f2' : 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    color: formData.type === 'expense' ? '#ef4444' : '#64748b',
                  }}
                >
                  ↙ Saída
                </button>
              </div>
            </div>

            {/* Descrição */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Descrição *
              </label>
              <input
                name="description"
                type="text"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Ex: Venda de produto"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              />
            </div>

            {/* Grid: Valor, Categoria, Data */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Valor (R$) *
                </label>
                <input
                  name="amount"
                  type="text"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  placeholder="0,00"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Categoria *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                  }}
                >
                  <option value="">Selecione</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Data *
                </label>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                  }}
                />
              </div>
            </div>

            {/* Forma de pagamento */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Forma de pagamento *
              </label>
              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              >
                <option value="avista">À vista</option>
                <option value="parcelado">Parcelado</option>
              </select>
            </div>

            {/* Número de parcelas e opções de lembrete */}
            {formData.paymentType === 'parcelado' && (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Número de parcelas *
                  </label>
                  <input
                    name="installments"
                    type="number"
                    min="2"
                    value={formData.installments}
                    onChange={handleChange}
                    required={formData.paymentType === 'parcelado'}
                    placeholder="Ex: 3"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                    }}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    Mínimo de 2 parcelas
                  </small>
                </div>

                {/* Opção de adicionar lembretes */}
                <div style={{
                  marginBottom: '1.5rem',
                  padding: '1.5rem',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px',
                  border: '2px solid #bae6fd',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <input
                      type="checkbox"
                      name="addReminders"
                      id="addReminders"
                      checked={formData.addReminders}
                      onChange={handleChange}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                      }}
                    />
                    <label 
                      htmlFor="addReminders"
                      style={{ 
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        color: '#0369a1',
                      }}
                    >
                      📅 Adicionar lembretes de pagamento
                    </label>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: '#0c4a6e', marginBottom: '1rem' }}>
                    Crie lembretes automáticos para cada parcela no seu calendário
                  </p>

                  {formData.addReminders && (
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#0369a1' }}>
                        Dia do mês para o lembrete (1-28) *
                      </label>
                      <input
                        name="reminderDay"
                        type="number"
                        min="1"
                        max="28"
                        value={formData.reminderDay}
                        onChange={handleChange}
                        required={formData.addReminders}
                        placeholder="Ex: 5"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #bae6fd',
                          borderRadius: '8px',
                          fontSize: '1rem',
                        }}
                      />
                      <small style={{ color: '#0c4a6e', fontSize: '0.875rem', display: 'block', marginTop: '0.5rem' }}>
                        💡 Escolha um dia fixo do mês para receber os lembretes das parcelas
                      </small>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Observações */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Observações
              </label>
              <textarea
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                rows={4}
                placeholder="Informações adicionais (opcional)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Botões */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '1rem',
                  backgroundColor: loading ? '#94a3b8' : '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Salvando...' : 'Salvar Movimentação'}
              </button>
              <button
                type="button"
                onClick={clearForm}
                style={{
                  flex: 1,
                  padding: '1rem',
                  backgroundColor: 'white',
                  color: '#64748b',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Limpar Formulário
              </button>
            </div>
          </form>
        </div>

        {/* Lista de TODAS as Transações */}
        {transactions.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginTop: '2rem',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Todas as Movimentações
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Total de {transactions.length} transações (ordenadas por data - mais recentes primeiro)
            </p>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Data</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Descrição</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Tipo</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#64748b' }}>Pagamento</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#64748b' }}>Valor</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                        {new Date(transaction.data_movimentacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>
                        {transaction.descricao}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          backgroundColor: transaction.tipo === 'entrada' ? '#dcfce7' : '#fee2e2',
                          color: transaction.tipo === 'entrada' ? '#166534' : '#991b1b',
                        }}>
                          {transaction.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                        {transaction.forma_pagamento === 'parcelado' 
                          ? `${transaction.quantidade_parcelas}x` 
                          : 'À vista'}
                      </td>
                      <td style={{ 
                        padding: '1rem', 
                        textAlign: 'right',
                        fontWeight: '600',
                        color: transaction.tipo === 'entrada' ? '#22c55e' : '#ef4444',
                      }}>
                        {transaction.tipo === 'entrada' ? '+' : '-'}R$ {(transaction.valor / 100).toFixed(2).replace('.', ',')}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => openDeleteModal(transaction.id, transaction.descricao)}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: '#fee2e2',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fecaca';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fee2e2';
                          }}
                          title="Excluir transação"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <CalendarInternal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} userEmail={userEmail} />
      <NotificationsPopup isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </div>
  );
};

export default NewTransaction;