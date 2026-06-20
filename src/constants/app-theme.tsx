import AsyncStorage from "@react-native-async-storage/async-storage";
import { DARK_COLORS, LIGHT_COLORS } from "@/constants/calculo-theme";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AppColors = typeof LIGHT_COLORS;
const THEME_STORAGE_KEY = "calculo.theme.dark.v1";

const AppThemeContext = createContext<{
  colors: AppColors;
  isDark: boolean;
  toggleTheme: () => void;
}>({
  colors: LIGHT_COLORS,
  isDark: false,
  toggleTheme: () => {},
});

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = useCallback(() => {
    setIsDark((current) => {
      const next = !current;
      void AsyncStorage.setItem(THEME_STORAGE_KEY, next ? "true" : "false");
      return next;
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    void AsyncStorage.getItem(THEME_STORAGE_KEY).then((storedTheme) => {
      if (mounted && storedTheme) {
        setIsDark(storedTheme === "true");
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      colors: isDark ? DARK_COLORS : LIGHT_COLORS,
      isDark,
      toggleTheme,
    }),
    [isDark, toggleTheme],
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}
