function StatCard({ label, value, helper }) {
  return (
    <div className="stat-card">
      <p className="muted-text">{label}</p>
      <h3>{value}</h3>
      <p>{helper}</p>
    </div>
  );
}

export default StatCard;
