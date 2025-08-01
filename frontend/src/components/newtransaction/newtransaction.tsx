import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';
import './newtransaction.css';

interface FormData {
  type: 'income' | 'expense';
  description: string;
  amount: string;
  category: string;
  documentNumber: string;
  date: string;
  observations: string;
}

export default function NewTransaction() {
  const [formData, setFormData] = useState<FormData>({
    type: 'income',
    description: '',
    amount: '',
    category: '',
    documentNumber: '',
    date: '',
    observations: '',
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      numeroDocumento: formData.documentNumber,
      data: formData.date,
      observacoes: formData.observations,
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
                <PiggyBank className="logo-icon" style={{ color: '#22c55e' }} />
                <span className="logo-text">CAPITAL ONLINE</span>
              </div>
            </div>
            <nav className="newtransaction-nav">
              <button 
                className="newtransaction-nav-button"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
              <button className="newtransaction-nav-button active">Nova movimentação</button>
              <button 
                className="newtransaction-nav-button"
                onClick={() => navigate('/graficos')}
              >
                Gráficos
              </button>
              <button 
                className="newtransaction-nav-button"
                onClick={() => navigate('/objetivos')}
              >
                Objetivos
              </button>
            </nav>
            <div className="newtransaction-header-actions">
              <div className="newtransaction-profile-circle">J</div>
            </div>
          </div>
        </div>
      </header>

      <main className="newtransaction-content">
        <h1 className="newtransaction-title">Nova movimentação</h1>
        <p className="newtransaction-subtitle">Registre uma nova entrada ou saída financeira</p>

        <div className="newtransaction-form-container">
          <form className="newtransaction-form" onSubmit={handleSubmit}>
            <label className="transaction-type-label">Tipo de movimentação</label>
            <div className="transaction-type-buttons">
              <button
                type="button"
                className={`transaction-type-button ${
                  formData.type === 'income' ? 'income' : ''
                }`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
              >
                <div className="transaction-type-button-content">
                  <div className="transaction-type-icon-container">
                    <span className="transaction-type-icon">↗</span>
                  </div>
                  <div className="transaction-type-text">
                    <span className="transaction-type-text-title">Entrada</span>
                    <span className="transaction-type-text-subtitle">Ex: salário, vendas, etc.</span>
                  </div>
                </div>
              </button>
              <button
                type="button"
                className={`transaction-type-button ${
                  formData.type === 'expense' ? 'expense' : ''
                }`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
              >
                <div className="transaction-type-button-content">
                  <div className="transaction-type-icon-container">
                    <span className="transaction-type-icon">↙</span>
                  </div>
                  <div className="transaction-type-text">
                    <span className="transaction-type-text-title">Saída</span>
                    <span className="transaction-type-text-subtitle">Ex: gastos, compras, etc.</span>
                  </div>
                </div>
              </button>
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">
                Descrição <span className="required">*</span>
              </label>
              <input
                name="description"
                type="text"
                className="form-input"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Valor <span className="required">*</span>
                </label>
                <input
                  name="amount"
                  type="number"
                  className="form-input"
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
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Número do Documento <span className="required">*</span>
                </label>
                <input
                  name="documentNumber"
                  type="text"
                  className="form-input"
                  value={formData.documentNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Data</label>
                <input
                  name="date"
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Observações</label>
              <textarea
                name="observations"
                className="form-textarea"
                value={formData.observations}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Movimentação'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Limpar Formulário
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}