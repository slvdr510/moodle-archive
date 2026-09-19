import { useEffect, useState } from 'react';
import { applyTheme, getStoredTheme, setStoredTheme, type Theme } from '../../lib/theme';

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function changeTheme(next: Theme): void {
    setStoredTheme(next);
    setTheme(next);
  }

  return [theme, changeTheme];
}
