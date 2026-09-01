import { themeColors, customThemes } from 'virtual:tindmark-config';

export interface ThemeColorMap {
  [label: string]: string;
}

export const DEFAULT_THEME_COLOR_KEY = 'Default';
export const DEFAULT_CUSTOM_THEME_KEY = 'Default';

export function loadThemeColors(): ThemeColorMap {
  return themeColors || {};
}

export function loadCustomThemes(): Record<string, string> {
  return customThemes || {};
}

const CUSTOM_THEME_STYLE_ID = 'tindmark-custom-theme-style';

export function applyCustomTheme(themeName: string | null) {
  const themes = loadCustomThemes();
  let styleEl = document.getElementById(CUSTOM_THEME_STYLE_ID) as HTMLStyleElement | null;

  if (!themeName || themeName === DEFAULT_CUSTOM_THEME_KEY || !themes[themeName]) {
    if (styleEl) {
      styleEl.textContent = '';
    }
    return;
  }

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = CUSTOM_THEME_STYLE_ID;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = themes[themeName] || '';
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

