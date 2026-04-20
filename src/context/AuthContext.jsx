import { createContext, useEffect, useMemo, useState } from "react";
import { subscribeToAuthChanges } from "../services/authService";
import { getOrCreateUserProfile } from "../services/dataService";
import { getFriendlyError } from "../services/serviceGuards";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (nextUser) => {
      setUser(nextUser);
      setAuthError("");

      if (!nextUser) {
        setProfile(null);
        setAuthLoading(false);
        return;
      }

      try {
        const nextProfile = await getOrCreateUserProfile(nextUser);
        setProfile(nextProfile);
      } catch (error) {
        setAuthError(getFriendlyError(error, "Unable to load your profile."));
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      authLoading,
      authError,
      setProfile,
    }),
    [user, profile, authLoading, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
