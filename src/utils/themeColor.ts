import * as yaml from 'js-yaml';
import colorYamlRaw from '../color.yaml?raw';

export interface ThemeColorMap {
  [label: string]: string;
}

export const DEFAULT_THEME_COLOR_KEY = 'Default';

export function loadThemeColors(): ThemeColorMap {
  try {
    const parsed = yaml.load(colorYamlRaw);
    if (parsed && typeof parsed === 'object') {
      const validColors: ThemeColorMap = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === 'string' && value.trim()) {
          validColors[key] = value.trim();
        }
      }
      return validColors;
    }
  } catch (err) {
    console.error('Failed to parse color.yaml:', err);
  }
  return {};
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
