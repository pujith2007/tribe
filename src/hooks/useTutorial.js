import { useEffect } from "react";
import { useAppContext } from "./useAppContext";

export function useTutorial(userId, enabled) {
  const { setTutorialOpen } = useAppContext();

  useEffect(() => {
    if (!userId || !enabled) {
      return;
    }

    const key = `creative-pulse-tutorial-${userId}`;
    const seenTutorial = localStorage.getItem(key);

    if (!seenTutorial) {
      setTutorialOpen(true);
    }
  }, [enabled, setTutorialOpen, userId]);
}
