import { createContext, useEffect, useMemo, useState } from "react";

const DEFAULT_PREFERENCES = {
  theme: "light",
  compactFeed: false,
  autoplayTutorial: true,
  emailAlerts: true,
};

export const AppContext = createContext(null);

function readPreferences() {
  const saved = localStorage.getItem("creative-pulse-preferences");

  if (!saved) {
    return DEFAULT_PREFERENCES;
  }

  try {
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function AppProvider({ children }) {
  const [preferences, setPreferences] = useState(readPreferences);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "creative-pulse-preferences",
      JSON.stringify(preferences),
    );
  }, [preferences]);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
  }, [preferences.theme]);

  const value = useMemo(
    () => ({
      preferences,
      setPreferences,
      tutorialOpen,
      setTutorialOpen,
      toggleTheme: () =>
        setPreferences((current) => ({
          ...current,
          theme: current.theme === "light" ? "dark" : "light",
        })),
    }),
    [preferences, tutorialOpen],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
