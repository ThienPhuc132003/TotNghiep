// Hook for Memory Monitor toggle
import { useState, useEffect } from "react";

export const useMemoryMonitor = () => {
  const [showMonitor, setShowMonitor] = useState(import.meta.env.DEV);

  useEffect(() => {
    const handleKeyPress = (event) => {
      // Toggle with Ctrl+Shift+M
      if (event.ctrlKey && event.shiftKey && event.key === "M") {
        setShowMonitor((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return { showMonitor, setShowMonitor };
};
