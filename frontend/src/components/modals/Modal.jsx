const Modal = ({ title, children, onClose }) => (
  <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="modal-card" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="Fechar">x</button>
      </div>
      {children}
    </section>
  </div>
);

export default Modal;
