import { useState } from 'react';
import { toInputDate } from '../../utils/formatDate.js';

const initialState = {
  type: 'expense',
  descricao: '',
  valor: '',
  tipo: 'fixo',
  recorrencia: 'mensal',
  data_inicio: toInputDate(),
  data_fim: '',
};

const TransactionForm = ({ initialValue, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({ ...initialState, ...(initialValue || {}) });
  const [errors, setErrors] = useState({});

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = (event) => {
    event.preventDefault();
    const fieldErrors = {};
    const descricao = String(form.descricao || '').trim();
    const valor = Number(String(form.valor).replace(',', '.'));

    if (!descricao) fieldErrors.descricao = 'Descrição é obrigatória.';
    if (!isFinite(valor) || valor <= 0) fieldErrors.valor = 'Valor deve ser maior que zero.';
    if (!form.data_inicio || isNaN(new Date(form.data_inicio).getTime())) fieldErrors.data_inicio = 'Data de início inválida.';
    if (form.data_fim) {
      if (isNaN(new Date(form.data_fim).getTime())) fieldErrors.data_fim = 'Data de término inválida.';
      else if (new Date(form.data_fim) < new Date(form.data_inicio)) fieldErrors.data_fim = 'Data de término deve ser igual ou posterior à data de início.';
    }

    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const payload = {
      descricao,
      valor,
      recorrencia: form.recorrencia,
      data_inicio: form.data_inicio,
      data_fim: form.data_fim || null,
    };

    if (form.type === 'expense') payload.tipo = form.tipo;
    onSubmit(form.type, payload);
  };

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>
        Tipo
        <select value={form.type} onChange={(event) => setField('type', event.target.value)} disabled={Boolean(initialValue)}>
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
          <option value="debt">Divida</option>
        </select>
      </label>

      <label>
        Descricao
        <input required value={form.descricao} onChange={(event) => setField('descricao', event.target.value)} placeholder="Ex: Salario, aluguel, cartao" />
        {errors.descricao && <span className="form-error">{errors.descricao}</span>}
      </label>

      <label>
        Valor
        <input required type="number" min="0" step="0.01" value={form.valor} onChange={(event) => setField('valor', event.target.value)} placeholder="0,00" />
        {errors.valor && <span className="form-error">{errors.valor}</span>}
      </label>

      {form.type === 'expense' && (
        <label>
          Tipo da despesa
          <select value={form.tipo} onChange={(event) => setField('tipo', event.target.value)}>
            <option value="fixo">Fixa</option>
            <option value="variavel">Variavel</option>
          </select>
        </label>
      )}

      <label>
        Recorrencia
        <select value={form.recorrencia} onChange={(event) => setField('recorrencia', event.target.value)}>
          <option value="mensal">Mensal</option>
          <option value="semanal">Semanal</option>
          <option value="anual">Anual</option>
          <option value="unica">Unica</option>
        </select>
      </label>

      <label>
        Data de inicio
        <input required type="date" value={form.data_inicio?.slice(0, 10)} onChange={(event) => setField('data_inicio', event.target.value)} />
        {errors.data_inicio && <span className="form-error">{errors.data_inicio}</span>}
      </label>

      <label>
        Data de termino
        <input type="date" value={form.data_fim?.slice(0, 10) || ''} onChange={(event) => setField('data_fim', event.target.value)} />
        {errors.data_fim && <span className="form-error">{errors.data_fim}</span>}
      </label>

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>Cancelar</button>
        <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
      </div>
    </form>
  );
};

export default TransactionForm;
