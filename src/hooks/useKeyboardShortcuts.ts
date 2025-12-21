import { useEffect } from "react";

export function useKeyboardShortcuts() {
  // We could trigger UI actions here or just providing focus shortcuts

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcuts that work anywhere (unless input focused?)
      // We usually want global shortcuts except when typing in an input

      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      // Ctrl/Cmd + O: Open file browser
      if ((e.ctrlKey || e.metaKey) && e.key === "o") {
        e.preventDefault();
        document.getElementById("file-input")?.click();
      }

      // Ctrl/Cmd + V: Paste (handled by browser usually, but we can intercept if needed)
      // Paste on Dropzone is handled by "paste" event. Global paste?
      // If we want global paste to work, we need a listener on window 'paste'.

      // Settings: Ctrl/Cmd + ,
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("open-settings"));
      }

      // Help: ?
      if (e.key === "?") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("open-help"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
