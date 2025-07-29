import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
  saveTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",

  setTheme: (theme: Theme): void => {
    set({ theme });
    // Update DOM immediately
    document.documentElement.setAttribute("data-theme", theme);
    // Save to storage
    get().saveTheme();
  },

  toggleTheme: (): void => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === "light" ? "dark" : "light";
    get().setTheme(newTheme);
  },

  loadTheme: async (): Promise<void> => {
    try {
      // Try to get theme from storage
      const result = await chrome.storage.sync.get(["theme"]);
      const theme = (result.theme as Theme) || "light";

      // Set state and update DOM
      set({ theme });
      document.documentElement.setAttribute("data-theme", theme);
    } catch (error) {
      console.error("Failed to load theme:", error);
      // Fallback to light theme
      set({ theme: "light" });
      document.documentElement.setAttribute("data-theme", "light");
    }
  },

  saveTheme: async (): Promise<void> => {
    try {
      await chrome.storage.sync.set({ theme: get().theme });
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  },
}));
