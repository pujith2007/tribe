import { useAppContext } from "./useAppContext";

export function useTheme() {
  const { preferences, toggleTheme } = useAppContext();

  return {
    theme: preferences.theme,
    toggleTheme,
  };
}
