/// <reference types="vite/client" />

declare module 'virtual:tindmark-config' {
  export interface SiteConfig {
    Title: string;
    Subtitle: string;
    Description: string;
    ColorPack: string;
    DefaultColor: string;
    DocsFolder: string;
    PublicFolder: string;
  }

  export const siteConfig: SiteConfig;
  export const themeColors: Record<string, string>;
  export default siteConfig;
}

declare module 'virtual:tindmark-docs' {
  export const markdownFiles: Record<string, string>;
  export const folderConfigs: Record<string, any>;
  export const docsFolderName: string;
}


