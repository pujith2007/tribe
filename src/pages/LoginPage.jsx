import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
} from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { getFriendlyError } from "../services/serviceGuards";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authError } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate(location.state?.from?.pathname || "/", { replace: true });
    }
  }, [location.state, navigate, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (isRegistering) {
        await registerWithEmail(form.name, form.email, form.password);
      } else {
        await loginWithEmail(form.email, form.password);
      }
    } catch (submitError) {
      setError(getFriendlyError(submitError, "Authentication failed."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setSubmitting(true);
    setError("");

    try {
      await loginWithGoogle();
    } catch (submitError) {
      setError(getFriendlyError(submitError, "Google sign-in failed."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <p className="eyebrow">Problem</p>
        <h1>Creative people often lose momentum because progress stays invisible.</h1>
        <p>
          Creative Pulse helps artists, designers, writers, photographers, and makers post
          one daily proof-of-work update, stay accountable with peers, and reflect on what
          consistency looks like over time.
        </p>
      </section>

      <section className="auth-card">
        <p className="eyebrow">{isRegistering ? "Create account" : "Welcome back"}</p>
        <h2>{isRegistering ? "Start your daily streak" : "Log in to your studio feed"}</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegistering ? (
            <input
              className="text-input"
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Full name"
              value={form.name}
            />
          ) : null}
          <input
            className="text-input"
            disabled={submitting}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email"
            type="email"
            value={form.email}
          />
          <input
            className="text-input"
            disabled={submitting}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            placeholder="Password"
            type="password"
            value={form.password}
          />
          {authError || error ? <p className="error-text">{authError || error}</p> : null}
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? "Please wait..." : isRegistering ? "Create account" : "Log in"}
          </button>
        </form>

        <button className="ghost-button full-width" onClick={handleGoogleLogin} type="button">
          Continue with Google
        </button>

        <button
          className="text-button"
          onClick={() => setIsRegistering((current) => !current)}
          type="button"
        >
          {isRegistering ? "Already have an account? Log in" : "New here? Create an account"}
        </button>
      </section>
    </div>
  );
}

export default LoginPage;
