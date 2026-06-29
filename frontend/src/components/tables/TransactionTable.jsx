import { Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';

const labels = {
  income: 'Receita',
  expense: 'Despesa',
  debt: 'Divida',
};

const TransactionTable = ({ items, onEdit, onDelete }) => (
  <div className="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Descricao</th>
          <th>Tipo</th>
          <th>Recorrencia</th>
          <th>Data de inicio</th>
          <th>Data de termino</th>
          <th>Valor</th>
          <th>Acoes</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={`${item.type}-${item.id}`}>
            <td>
              <strong>{item.descricao}</strong>
              <small>{item.category}</small>
            </td>
            <td><span className={`pill ${item.type}`}>{labels[item.type]}</span></td>
            <td>{item.recorrencia}</td>
            <td>{formatDate(item.data_inicio)}</td>
            <td>{formatDate(item.data_fim)}</td>
            <td className="money">{formatCurrency(item.valor)}</td>
            <td>
              <div className="row-actions">
                <button className="icon-button" onClick={() => onEdit(item)} aria-label="Editar"><Edit2 size={16} /></button>
                <button className="icon-button danger" onClick={() => onDelete(item)} aria-label="Excluir"><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TransactionTable;
