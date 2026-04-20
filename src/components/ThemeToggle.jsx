import { useTheme } from "../hooks/useTheme";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="ghost-button" type="button" onClick={toggleTheme}>
      {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    </button>
  );
}

export default ThemeToggle;
