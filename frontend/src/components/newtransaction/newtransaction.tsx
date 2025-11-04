import React, { useState, useEffect } from 'react';
import { PiggyBank, Calendar, Bell, LogOut, User, CheckCircle, XCircle, Trash2, AlertCircle, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type, message: '' });
    }, 4000);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
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
    <div className="newtransaction-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className="toast-notification" style={{
          backgroundColor: toast.type === 'success' ? '#22c55e' : '#ef4444',
        }}>
          {toast.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <div className="delete-modal-icon">
                <AlertCircle size={24} color="#ef4444" />
              </div>
              <h2 className="delete-modal-title">Confirmar Exclusão</h2>
            </div>

            <p className="delete-modal-message">
              Tem certeza que deseja excluir a transação <strong>"{deleteModal.transactionName}"</strong>?
              Esta ação não pode ser desfeita.
            </p>

            <div className="delete-modal-buttons">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-delete"
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
            <button 
              className="menu-button" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="logo">
              <div className="logo-icon">
                <PiggyBank size={32} />
              </div>
              <span className="logo-text">CAPITAL ONLINE</span>
            </div>
          </div>

          <div className="header-center">
            <button className="nav-button" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="nav-button active" onClick={() => navigate('/nova-movimentacao')}>Nova movimentação</button>
            <button className="nav-button" onClick={() => navigate('/graficos')}>Gráficos</button>
            <button className="nav-button" onClick={() => navigate('/objetivos')}>Objetivos</button>
          </div>

          <div className="header-right">
            <button className="icon-button" onClick={() => setIsCalendarOpen(true)}>
              <Calendar size={20} />
            </button>
            <button className="icon-button" onClick={() => setIsNotificationsOpen(true)}>
              <Bell size={20} />
            </button>
            <div className="profile-avatar" onClick={() => navigate('/profile')}>
              <User size={20} />
            </div>
            <button className="icon-button logout" onClick={handleLogout}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <button className="mobile-menu-item" onClick={() => handleNavigate('/dashboard')}>
            Dashboard
          </button>
          <button className="mobile-menu-item" onClick={() => handleNavigate('/nova-movimentacao')}>
            Nova movimentação
          </button>
          <button className="mobile-menu-item" onClick={() => handleNavigate('/graficos')}>
            Gráficos
          </button>
          <button className="mobile-menu-item" onClick={() => handleNavigate('/objetivos')}>
            Objetivos
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="newtransaction-content">
        <h1 className="newtransaction-title">
          Nova movimentação
        </h1>
        
        <p className="newtransaction-subtitle">
          Registre uma nova entrada ou saída financeira
        </p>

        <div className="newtransaction-form-container">
          <form className="newtransaction-form" onSubmit={handleSubmit}>
            {/* Tipo de movimentação */}
            <div className="form-group">
              <label className="transaction-type-label">
                Tipo de movimentação
              </label>
              <div className="transaction-type-buttons">
                <button
                  type="button"
                  className={`transaction-type-button ${formData.type === 'income' ? 'income' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                >
                  <div className="transaction-type-button-content">
                    <div className="transaction-type-icon-container">
                      <span className="transaction-type-icon">↗</span>
                    </div>
                    <div className="transaction-type-text">
                      <div className="transaction-type-text-title">Entrada</div>
                      <div className="transaction-type-text-subtitle">Recebimentos</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  className={`transaction-type-button ${formData.type === 'expense' ? 'expense' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                >
                  <div className="transaction-type-button-content">
                    <div className="transaction-type-icon-container">
                      <span className="transaction-type-icon">↙</span>
                    </div>
                    <div className="transaction-type-text">
                      <div className="transaction-type-text-title">Saída</div>
                      <div className="transaction-type-text-subtitle">Pagamentos</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Descrição */}
            <div className="form-group">
              <label className="form-label">
                Descrição <span className="required">*</span>
              </label>
              <input
                name="description"
                type="text"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Ex: Venda de produto"
                className="form-input"
              />
            </div>

            {/* Grid: Valor, Categoria, Data */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Valor (R$) <span className="required">*</span>
                </label>
                <input
                  name="amount"
                  type="text"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  placeholder="0,00"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Categoria <span className="required">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">Selecione</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Data <span className="required">*</span>
                </label>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* Forma de pagamento */}
            <div className="form-group">
              <label className="form-label">
                Forma de pagamento <span className="required">*</span>
              </label>
              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="avista">À vista</option>
                <option value="parcelado">Parcelado</option>
              </select>
            </div>

            {/* Número de parcelas e opções de lembrete */}
            {formData.paymentType === 'parcelado' && (
              <>
                <div className="form-group">
                  <label className="form-label">
                    Número de parcelas <span className="required">*</span>
                  </label>
                  <input
                    name="installments"
                    type="number"
                    min="2"
                    value={formData.installments}
                    onChange={handleChange}
                    required={formData.paymentType === 'parcelado'}
                    placeholder="Ex: 3"
                    className="form-input"
                  />
                  <small className="form-hint">
                    Mínimo de 2 parcelas
                  </small>
                </div>

                {/* Opção de adicionar lembretes */}
                <div className="reminders-section">
                  <div className="reminders-checkbox">
                    <input
                      type="checkbox"
                      name="addReminders"
                      id="addReminders"
                      checked={formData.addReminders}
                      onChange={handleChange}
                    />
                    <label htmlFor="addReminders">
                      📅 Adicionar lembretes de pagamento
                    </label>
                  </div>

                  <p className="reminders-description">
                    Crie lembretes automáticos para cada parcela no seu calendário
                  </p>

                  {formData.addReminders && (
                    <div className="reminders-day">
                      <label className="form-label">
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
                        className="form-input"
                      />
                      <small className="form-hint">
                        💡 Escolha um dia fixo do mês para receber os lembretes das parcelas
                      </small>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Observações */}
            <div className="form-group form-grid-full">
              <label className="form-label">
                Observações
              </label>
              <textarea
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                rows={4}
                placeholder="Informações adicionais (opcional)"
                className="form-textarea"
              />
            </div>

            {/* Botões */}
            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Salvando...' : 'Salvar Movimentação'}
              </button>
              <button
                type="button"
                onClick={clearForm}
                className="btn-secondary"
              >
                Limpar Formulário
              </button>
            </div>
          </form>
        </div>

        {/* Lista de TODAS as Transações */}
        {transactions.length > 0 && (
          <div className="transactions-container">
            <h2 className="transactions-title">
              Todas as Movimentações
            </h2>
            <p className="transactions-subtitle">
              Total de {transactions.length} transações (ordenadas por data - mais recentes primeiro)
            </p>
            
            <div className="transactions-table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Tipo</th>
                    <th>Pagamento</th>
                    <th>Valor</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="transaction-date">
                        {new Date(transaction.data_movimentacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="transaction-description">
                        {transaction.descricao}
                      </td>
                      <td className="transaction-type">
                        <span className={`transaction-badge ${transaction.tipo}`}>
                          {transaction.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="transaction-payment">
                        {transaction.forma_pagamento === 'parcelado' 
                          ? `${transaction.quantidade_parcelas}x` 
                          : 'À vista'}
                      </td>
                      <td className={`transaction-value ${transaction.tipo}`}>
                        {transaction.tipo === 'entrada' ? '+' : '-'}R$ {(transaction.valor / 100).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="transaction-actions">
                        <button
                          onClick={() => openDeleteModal(transaction.id, transaction.descricao)}
                          className="delete-button"
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