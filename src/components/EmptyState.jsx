function EmptyState({ title, message }) {
  return (
    <div className="panel empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
