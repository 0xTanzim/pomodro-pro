import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/themeStore";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle(): JSX.Element {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-10 w-10 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      ) : (
        <Sun className="h-5 w-5 text-gray-400" />
      )}
    </Button>
  );
}
