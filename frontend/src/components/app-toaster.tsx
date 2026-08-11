import { Toaster } from "sonner";
import { useTheme } from "@/context/ThemeContext";

export function AppToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme as "light" | "dark" | "system"}
      position="top-right"
      richColors
      closeButton
    />
  );
}
