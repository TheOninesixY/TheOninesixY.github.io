import { siteConfig, SiteConfig } from 'virtual:tindmark-config';

export type { SiteConfig };

export function loadSiteConfig(): SiteConfig {
  return siteConfig;
}

