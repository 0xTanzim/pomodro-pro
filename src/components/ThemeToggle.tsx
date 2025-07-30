import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Monitor } from "lucide-react";

export default function ThemeToggle(): JSX.Element {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "system") {
      return <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
    return resolvedTheme === "light" ? (
      <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
    ) : (
      <Sun className="h-5 w-5 text-gray-400" />
    );
  };

  const getTitle = () => {
    if (theme === "light") return "Switch to dark mode";
    if (theme === "dark") return "Switch to system theme";
    return "Switch to light mode";
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-10 w-10 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
      title={getTitle()}
    >
      {getIcon()}
    </Button>
  );
}
