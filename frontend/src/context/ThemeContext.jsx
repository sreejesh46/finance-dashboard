import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'findash-theme';

export const ThemeProvider = ({ children }) => {
  const hasMountedRef = useRef(false);
  const [themeTransitionActive, setThemeTransitionActive] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    let transitionTimer;

    if (hasMountedRef.current) {
      document.documentElement.classList.add('theme-switching');
      transitionTimer = window.setTimeout(() => {
        document.documentElement.classList.remove('theme-switching');
      }, 320);
    } else {
      hasMountedRef.current = true;
    }

    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
    document.body.classList.toggle('dark-theme', theme === 'dark');

    return () => {
      if (transitionTimer) {
        window.clearTimeout(transitionTimer);
      }
      document.documentElement.classList.remove('theme-switching');
    };
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      themeTransitionActive,
      toggleTheme: () => {
        setThemeTransitionActive(true);
        window.requestAnimationFrame(() => {
          setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
          window.setTimeout(() => {
            setThemeTransitionActive(false);
          }, 280);
        });
      },
    }),
    [theme, themeTransitionActive]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
};
