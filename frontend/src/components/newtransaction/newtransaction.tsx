import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  type: 'income' | 'expense';
  description: string;
  amount: string;
  category: string;
  date: string;
}

export default function NewTransaction() {
  const [formData, setFormData] = useState<FormData>({
    type: 'income',
    description: '',
    amount: '',
    category: '',
    date: '',
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      titulo: formData.description,
      tipo: formData.type === 'income' ? 'entrada' : 'saida',
      valor: parseFloat(formData.amount),
      categoria: formData.category,
      data: formData.date,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/transacoes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        const error = await response.json();
        alert('Erro ao salvar: ' + JSON.stringify(error));
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newtransaction-container">
      <header className="newtransaction-header">
        <div className="newtransaction-header-inner">
          <div className="newtransaction-header-flex">
            <div className="newtransaction-logo-group">
              <div className="logo">
                <span className="logo-icon">💰</span>
                <span className="logo-text">Capital Online</span>
              </div>
            </div>
            <nav className="newtransaction-nav">
              <button className="newtransaction-nav-button active">Nova Transação</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="newtransaction-content">
        <button className="newtransaction-back-button" onClick={() => navigate('/dashboard')}>
          ← Voltar
        </button>

        <h1 className="newtransaction-title">Nova Transação</h1>
        <p className="newtransaction-subtitle">Cadastre uma nova entrada ou saída financeira.</p>

        <div className="newtransaction-form-container">
          <form className="newtransaction-form" onSubmit={handleSubmit}>
            <label className="transaction-type-label">Tipo de Transação</label>
            <div className="transaction-type-buttons">
              <button
                type="button"
                className={`transaction-type-button income ${
                  formData.type === 'income' ? 'income' : ''
                }`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
              >
                <div className="transaction-type-button-content">
                  <div className="transaction-type-icon-container">
                    <span className="transaction-type-icon">⬆️</span>
                  </div>
                  <div className="transaction-type-text">
                    <span className="transaction-type-text-title">Entrada</span>
                    <span className="transaction-type-text-subtitle">Dinheiro que entra</span>
                  </div>
                </div>
              </button>
              <button
                type="button"
                className={`transaction-type-button expense ${
                  formData.type === 'expense' ? 'expense' : ''
                }`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
              >
                <div className="transaction-type-button-content">
                  <div className="transaction-type-icon-container">
                    <span className="transaction-type-icon">⬇️</span>
                  </div>
                  <div className="transaction-type-text">
                    <span className="transaction-type-text-title">Saída</span>
                    <span className="transaction-type-text-subtitle">Dinheiro que sai</span>
                  </div>
                </div>
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Descrição <span className="required">*</span>
                </label>
                <input
                  name="description"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Salário, Compra..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Valor <span className="required">*</span>
                </label>
                <input
                  name="amount"
                  type="number"
                  className="form-input"
                  placeholder="Ex: 1000"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Categoria <span className="required">*</span>
                </label>
                <input
                  name="category"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Alimentação, Transporte"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Data <span className="required">*</span>
                </label>
                <input
                  name="date"
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
