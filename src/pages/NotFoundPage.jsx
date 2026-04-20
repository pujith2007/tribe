import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="not-found">
      <p className="eyebrow">404</p>
      <h1>That page drifted out of frame.</h1>
      <Link className="primary-button" to="/">
        Return to feed
      </Link>
    </div>
  );
}

export default NotFoundPage;
