import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logoutUser } from "../services/authService";
import { getFriendlyError } from "../services/serviceGuards";
import ThemeToggle from "./ThemeToggle";
import TutorialModal from "./TutorialModal";
import { useState } from "react";

const NAV_ITEMS = [
  { to: "/", label: "Feed", helper: "Daily progress" },
  { to: "/profile", label: "Profile", helper: "Stats and uploads" },
  { to: "/settings", label: "Settings", helper: "Preferences" },
];

function AppShell() {
  const location = useLocation();
  const { profile, authError } = useAuth();
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    setLogoutError("");

    try {
      await logoutUser();
    } catch (error) {
      setLogoutError(getFriendlyError(error, "Unable to log out right now."));
    }
  }

  function resolvePath(to) {
    if (to === "/profile") {
      return profile?.id ? `/profile/${profile.id}` : "/profile";
    }

    return to;
  }

  const currentSection =
    NAV_ITEMS.find((item) =>
      location.pathname === resolvePath(item.to) ||
      (item.to === "/profile" && location.pathname.startsWith("/profile")) ||
      (item.to === "/settings" && location.pathname.startsWith("/settings")),
    ) || NAV_ITEMS[0];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-card">
          <p className="eyebrow">Creative progress network</p>
          <h1>Creative Pulse</h1>
          <p>
            Share a daily proof-of-progress moment and keep your momentum visible.
          </p>
        </div>

        <nav className="nav-list">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={resolvePath(item.to)}>
              <span>{item.label}</span>
              <small>{item.helper}</small>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {(authError || logoutError) ? <p className="error-text">{authError || logoutError}</p> : null}
          <ThemeToggle />
          <button className="ghost-button" onClick={handleLogout} type="button">
            Log out
          </button>
        </div>
      </aside>

      <main className="content-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Current space</p>
            <h2>{currentSection.label}</h2>
          </div>
          <div className="topbar-profile">
            <div className="presence-dot" />
            <div>
              <strong>{profile?.name || "Creator"}</strong>
              <p className="muted-text">{currentSection.helper}</p>
            </div>
          </div>
        </header>
        <Outlet />
      </main>

      <nav className="mobile-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={resolvePath(item.to)}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <TutorialModal />
    </div>
  );
}

export default AppShell;
