import React, { useState, useEffect } from 'react';
import { PiggyBank, Calendar, Bell, LogOut, User, CheckCircle, XCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast>({ show: false, type: 'success', message: '' });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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

  useEffect(() => {
    const token = localStorage.getItem('token')?.replace(/"/g, '');
    if (!token) {
      showToast('error', 'Usuário não autenticado.');
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/categorias/', {
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

    // Pegar o ID do usuário
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
    console.log('📊 Dados do formulário:', {
      installments: formData.installments,
      reminderDay: formData.reminderDay,
      date: formData.date,
      amount: formData.amount,
      description: formData.description,
      movimentacaoId: movimentacaoId,
      usuarioId: usuarioId,
      tipo: formData.type
    });

    try {
      const installments = parseInt(formData.installments);
      const reminderDay = parseInt(formData.reminderDay);
      const startDate = new Date(formData.date);
      const amount = parseFloat(formData.amount);
      const installmentValue = amount / installments;

      console.log(`📅 Criando ${installments} lembretes com vencimento no dia ${reminderDay} de cada mês`);
      console.log(`💰 Valor por parcela: R$ ${installmentValue.toFixed(2)}`);

      const reminders = [];
      const errors = [];
      
      for (let i = 1; i <= installments; i++) {
        try {
          // Calcular a data de vencimento baseada no dia escolhido
          const dueDate = new Date(startDate);
          
          // Avançar para o mês da parcela (i=1 é primeiro mês, i=2 é segundo mês, etc)
          dueDate.setMonth(startDate.getMonth() + (i - 1));
          
          // Definir o dia escolhido pelo usuário
          dueDate.setDate(reminderDay);
          
          // Ajustar se o dia não existe no mês (ex: 31 em fevereiro)
          if (dueDate.getDate() !== reminderDay) {
            // Voltar para o último dia válido do mês
            dueDate.setDate(0);
          }
          
          // Se a data calculada for no passado, avançar para o próximo mês
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          if (dueDate < hoje) {
            dueDate.setMonth(dueDate.getMonth() + 1);
            dueDate.setDate(reminderDay);
            if (dueDate.getDate() !== reminderDay) {
              dueDate.setDate(0);
            }
          }

          const reminderPayload = {
            movimentacao: movimentacaoId,
            usuario: usuarioId,  // 🆕 ADICIONADO
            numero_parcela: i,
            total_parcelas: installments,
            valor_parcela: parseFloat(installmentValue.toFixed(2)),
            data_vencimento: dueDate.toISOString().split('T')[0],
            titulo: `Parcela ${i}/${installments}: ${formData.description}`,
            descricao: `Valor da parcela: R$ ${installmentValue.toFixed(2)}${formData.observations ? '\n' + formData.observations : ''}`,
            pago: false,
            notificado: false,
          };

          console.log(`\n📤 Enviando lembrete ${i}/${installments}:`);
          console.log('Payload:', JSON.stringify(reminderPayload, null, 2));

          const response = await fetch('http://127.0.0.1:8000/api/lembretes/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(reminderPayload),
          });

          const responseText = await response.text();
          console.log(`📥 Status ${i}: ${response.status}`);
          console.log(`📥 Resposta completa ${i}:`, responseText);

          if (!response.ok) {
            let errorData;
            try {
              errorData = JSON.parse(responseText);
              console.error(`❌ Erro ao criar lembrete ${i}:`, errorData);
              console.error('Detalhes do erro:', JSON.stringify(errorData, null, 2));
            } catch (parseError) {
              errorData = { detail: responseText };
              console.error(`❌ Erro ao criar lembrete ${i} (texto):`, responseText);
            }
            
            // Tentar extrair mensagem de erro mais clara
            let errorMsg = '';
            if (typeof errorData === 'object') {
              if (errorData.detail) {
                errorMsg = errorData.detail;
              } else if (errorData.error) {
                errorMsg = errorData.error;
              } else {
                // Tentar pegar o primeiro campo com erro
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
            
            console.error(`❌ Mensagem de erro extraída:`, errorMsg);
            errors.push(`Parcela ${i}: ${errorMsg}`);
            continue; // Continua tentando criar os outros lembretes
          }

          const result = JSON.parse(responseText);
          console.log(`✅ Lembrete ${i} criado com sucesso! ID: ${result.id}`);
          reminders.push(result);
        } catch (innerError: any) {
          console.error(`❌ Erro na parcela ${i}:`, innerError);
          errors.push(`Parcela ${i}: ${innerError.message}`);
        }
      }

      if (errors.length > 0) {
        console.error('❌ Erros encontrados:', errors);
        showToast('error', `Alguns lembretes falharam: ${errors.join(', ')}`);
        return false;
      }

      console.log(`✅ Todos os ${reminders.length} lembretes criados com sucesso!`);
      return true;
    } catch (error: any) {
      console.error('❌ Erro geral ao criar lembretes:', error);
      console.error('Stack:', error.stack);
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
      valor: parseFloat(formData.amount),
      categoria: parseInt(formData.category),
      data_movimentacao: `${formData.date}T12:00:00`,
      observacoes: formData.observations.trim(),
      forma_pagamento: formData.paymentType,
      quantidade_parcelas: formData.paymentType === 'parcelado' ? parseInt(formData.installments) : null,
    };

    console.log('📤 Enviando movimentação:', payload);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/transacoes/', {
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
        console.error('❌ Erro da API:', error);
        
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
        
        // Criar lembretes se necessário
        if (formData.paymentType === 'parcelado' && formData.addReminders) {
          const remindersSuccess = await createReminders(result.id);
          if (remindersSuccess) {
            showToast('success', `🎉 Movimentação salva! ${formData.installments} lembretes criados no calendário.`);
          } else {
            showToast('success', '✅ Movimentação salva! (Erro ao criar alguns lembretes)');
          }
        } else {
          showToast('success', '✅ Movimentação salva com sucesso!');
        }
        
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
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('❌ Erro de conexão:', err);
      showToast('error', 'Erro ao conectar com o servidor. Verifique se a API está rodando.');
    } finally {
      setLoading(false);
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

      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 2rem',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PiggyBank size={32} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>CAPITAL ONLINE</span>
          </div>

          <nav style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: '#334155',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/nova-movimentacao')}
              style={{
                padding: '0.5rem 1rem',
                color: '#10b981',
                background: '#f0fdf4',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Nova movimentação
            </button>
            <button 
              onClick={() => navigate('/graficos')}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: '#334155',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Gráficos
            </button>
            <button 
              onClick={() => navigate('/objetivos')}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: '#334155',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Objetivos
            </button>
          </nav>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              onClick={() => setIsCalendarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Calendar size={20} />
            </button>
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Bell size={20} />
            </button>
            <div 
              onClick={() => navigate('/profile')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <User size={18} />
            </div>
            <button 
              onClick={handleLogout}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                color: '#ef4444',
              }}
            >
              <LogOut size={20} />
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
                  type="number"
                  step="0.01"
                  min="0"
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
      </main>

      <CalendarInternal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} userEmail={userEmail} />
      <NotificationsPopup isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </div>
  );
};

export default NewTransaction;