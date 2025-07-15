import React, { useState } from 'react';
import { DollarSign, ArrowLeft, Calendar,FileText,Tag,Save,X,TrendingUp,TrendingDown,BarChart3,PlusCircle,Target,LogOut
} from 'lucide-react';

type Page = 'dashboard' | 'charts' | 'goals';

interface NewTransactionProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const NewTransaction: React.FC<NewTransactionProps> = ({ onNavigate, onLogout }) => {
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    description: '',
    amount: '',
    category: '',
    document: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = {
    income: ['Vendas', 'Serviços', 'Investimentos', 'Outros'],
    expense: ['Utilidades', 'Alimentação', 'Transporte', 'Equipamentos', 'Marketing', 'Outros']
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.document.trim()) {
      newErrors.document = 'Número do documento é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Nova transação:', formData);
      alert('Movimentação criada com sucesso!');
      onNavigate('dashboard');
    }
  };

  const handleReset = () => {
    setFormData({
      type: 'income',
      description: '',
      amount: '',
      category: '',
      document: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setErrors({});
  };

  return (
    <div className="newtransaction-container">
      <header className="newtransaction-header">
        <div className="newtransaction-header-inner">
          <div className="newtransaction-header-flex">
            <div className="newtransaction-logo-group">
              <div className="newtransaction-logo-icon">
                <DollarSign />
              </div>
              <span className="newtransaction-logo-text">CAPITAL ONLINE</span>
              <nav className="newtransaction-nav" aria-label="Main navigation">
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="newtransaction-nav-button"
                >
                  Dashboard
                </button>
                <button className="newtransaction-nav-button active">
                  <PlusCircle className="icon-small" />
                  <span>Nova movimentação</span>
                </button>
                <button 
                  onClick={() => onNavigate('charts')}
                  className="newtransaction-nav-button"
                >
                  <BarChart3 className="icon-small" />
                  <span>Gráficos</span>
                </button>
                <button 
                  onClick={() => onNavigate('goals')}
                  className="newtransaction-nav-button"
                >
                  <Target className="icon-small" />
                  <span>Objetivos</span>
                </button>
              </nav>
            </div>
            <div className="newtransaction-header-actions">
              <button className="newtransaction-action-button" title="Calendário">
                <Calendar />
              </button>
              <button 
                onClick={onLogout}
                className="newtransaction-action-button logout"
                title="Sair"
              >
                <LogOut />
              </button>
              <div className="newtransaction-profile-circle">
                P
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="newtransaction-content">
        <div className="mb-8">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="newtransaction-back-button"
          >
            <ArrowLeft className="icon-small" />
            <span>Voltar ao Dashboard</span>
          </button>
          <h1 className="newtransaction-title">Nova Movimentação</h1>
          <p className="newtransaction-subtitle">Registre uma nova entrada ou saída financeira.</p>
        </div>

        <section className="newtransaction-form-container">
          <form onSubmit={handleSubmit} className="newtransaction-form" noValidate>
            <div className="newtransaction-section">
              <label className="transaction-type-label">Tipo de Movimentação</label>
              <div className="transaction-type-buttons">
                <button
                  type="button"
                  onClick={() => handleInputChange('type', 'income')}
                  className={`transaction-type-button ${
                    formData.type === 'income' ? 'income' : ''
                  }`}
                >
                  <div className="transaction-type-button-content">
                    <div className="transaction-type-icon-container">
                      <TrendingUp className="transaction-type-icon" />
                    </div>
                    <div>
                      <div className="transaction-type-text-title">Entrada</div>
                      <div className="transaction-type-text-subtitle">Receita, venda, etc.</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('type', 'expense')}
                  className={`transaction-type-button ${
                    formData.type === 'expense' ? 'expense' : ''
                  }`}
                >
                  <div className="transaction-type-button-content">
                    <div className="transaction-type-icon-container">
                      <TrendingDown className="transaction-type-icon" />
                    </div>
                    <div>
                      <div className="transaction-type-text-title">Saída</div>
                      <div className="transaction-type-text-subtitle">Despesa, compra, etc.</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="description" className="form-label">
                  Descrição *
                </label>
                <div style={{ position: 'relative' }}>
                  <FileText className="form-icon" />
                  <input
                    type="text"
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`form-input ${errors.description ? 'error-border' : ''}`}
                    placeholder="Ex: Venda de produtos, Conta de luz..."
                  />
                </div>
                {errors.description && (
                  <p className="error-message">{errors.description}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="amount" className="form-label">
                  Valor (R$) *
                </label>
                <div style={{ position: 'relative' }}>
                  <DollarSign className="form-icon" />
                  <input
                    type="number"
                    id="amount"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className={`form-input ${errors.amount ? 'error-border' : ''}`}
                    placeholder="0,00"
                  />
                </div>
                {errors.amount && (
                  <p className="error-message">{errors.amount}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Categoria *
                </label>
                <div style={{ position: 'relative' }}>
                  <Tag className="form-icon" />
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`form-select ${errors.category ? 'error-border' : ''}`}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories[formData.type].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category && (
                  <p className="error-message">{errors.category}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="document" className="form-label">
                  Número do Documento *
                </label>
                <input
                  type="text"
                  id="document"
                  value={formData.document}
                  onChange={(e) => handleInputChange('document', e.target.value)}
                  className={`form-input ${errors.document ? 'error-border' : ''}`}
                  placeholder="Ex: 123456"
                />
                {errors.document && (
                  <p className="error-message">{errors.document}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="date" className="form-label">
                  Data
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="notes" className="form-label">
                  Observações
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="form-textarea"
                  placeholder="Informações adicionais sobre esta movimentação..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                <Save className="icon-small" />
                <span>Salvar Movimentação</span>
              </button>
              
              <button type="button" onClick={handleReset} className="btn-secondary">
                <X className="icon-small" />
                <span>Limpar Formulário</span>
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default NewTransaction;