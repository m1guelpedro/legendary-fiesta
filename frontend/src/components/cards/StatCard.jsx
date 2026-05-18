const StatCard = ({ title, value, icon: Icon, tone = 'neutral', hint }) => (
  <article className={`stat-card ${tone}`}>
    <div className="stat-icon">{Icon && <Icon size={22} />}</div>
    <div>
      <span>{title}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  </article>
);

export default StatCard;
