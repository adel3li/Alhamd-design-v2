/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to "true" to show «رحلتي», the paywall and the developer tools. Hidden by default. */
  readonly VITE_ENABLE_JOURNEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
