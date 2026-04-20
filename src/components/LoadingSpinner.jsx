function LoadingSpinner({ fullScreen = false, label = "Loading" }) {
  return (
    <div className={fullScreen ? "loading-screen" : "loading-inline"}>
      <div className="spinner" />
      <p>{label}...</p>
    </div>
  );
}

export default LoadingSpinner;
