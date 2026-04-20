import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAppContext } from "../hooks/useAppContext";
import { updateUserProfile } from "../services/dataService";
import { getFriendlyError } from "../services/serviceGuards";

function SettingsPage() {
  const { profile, setProfile } = useAuth();
  const { preferences, setPreferences } = useAppContext();
  const [form, setForm] = useState({
    name: "",
    bio: "",
    weeklyGoal: 5,
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        bio: profile.bio || "",
        weeklyGoal: profile.weeklyGoal || 5,
      });
    }
  }, [profile]);

  if (!profile) {
    return <div className="settings-page" />;
  }

  async function handleProfileSave(event) {
    event.preventDefault();
    setStatus("");
    setError("");

    try {
      await updateUserProfile(profile.id, {
        name: form.name,
        bio: form.bio,
        weeklyGoal: Number(form.weeklyGoal),
      });

      setProfile((current) => ({
        ...current,
        name: form.name,
        bio: form.bio,
        weeklyGoal: Number(form.weeklyGoal),
      }));
      setStatus("Profile updated.");
    } catch (saveError) {
      setError(getFriendlyError(saveError, "Unable to save profile settings."));
    }
  }

  function handlePreferenceToggle(key) {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  return (
    <div className="settings-page">
      <section className="panel">
        <p className="eyebrow">Profile preferences</p>
        <h1>Settings</h1>
        <form className="settings-form" onSubmit={handleProfileSave}>
          <input
            className="text-input"
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Display name"
            value={form.name}
          />
          <textarea
            className="text-input"
            onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
            placeholder="Bio"
            rows="4"
            value={form.bio}
          />
          <input
            className="text-input"
            min="1"
            onChange={(event) =>
              setForm((current) => ({ ...current, weeklyGoal: event.target.value }))
            }
            type="number"
            value={form.weeklyGoal}
          />
          {status ? <p className="success-banner">{status}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit">
            Save profile
          </button>
        </form>
      </section>

      <section className="panel">
        <p className="eyebrow">App preferences</p>
        <div className="settings-list">
          <label className="toggle-row">
            <span>Compact feed layout</span>
            <input
              checked={preferences.compactFeed}
              onChange={() => handlePreferenceToggle("compactFeed")}
              type="checkbox"
            />
          </label>
          <label className="toggle-row">
            <span>Autoplay tutorial for new sign-ins</span>
            <input
              checked={preferences.autoplayTutorial}
              onChange={() => handlePreferenceToggle("autoplayTutorial")}
              type="checkbox"
            />
          </label>
          <label className="toggle-row">
            <span>Email alerts preference</span>
            <input
              checked={preferences.emailAlerts}
              onChange={() => handlePreferenceToggle("emailAlerts")}
              type="checkbox"
            />
          </label>
        </div>
      </section>
    </div>
  );
}

export default SettingsPage;
