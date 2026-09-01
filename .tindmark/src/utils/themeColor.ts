import { themeColors } from 'virtual:tindmark-config';

export interface ThemeColorMap {
  [label: string]: string;
}

export const DEFAULT_THEME_COLOR_KEY = 'Default';

export function loadThemeColors(): ThemeColorMap {
  return themeColors || {};
}


export function applyCustomAccentColor(hexColor: string | null) {
  const root = document.documentElement;
  if (!hexColor) {
    root.style.removeProperty('--accent-color');
    root.style.removeProperty('--border-color');
    root.style.removeProperty('--text-primary');
    return;
  }

  root.style.setProperty('--accent-color', hexColor);
  root.style.setProperty('--border-color', hexColor);
  root.style.setProperty('--text-primary', hexColor);
}

