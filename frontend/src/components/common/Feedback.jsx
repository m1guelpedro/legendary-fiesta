export const LoadingState = ({ label = 'Carregando dados...' }) => (
  <div className="state-box loading">{label}</div>
);

export const EmptyState = ({ title = 'Nenhum dado encontrado', description = 'Quando houver registros, eles aparecem aqui.' }) => (
  <div className="state-box">
    <strong>{title}</strong>
    <span>{description}</span>
  </div>
);

export const ErrorState = ({ message }) => (
  <div className="state-box error">{message}</div>
);

export const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  return (
    <button className={`toast ${type}`} onClick={onClose}>
      {message}
    </button>
  );
};
