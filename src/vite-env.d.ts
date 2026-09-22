/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the 12E/12D backend API (e.g. http://localhost:4000).
   *  Falls back to http://localhost:4000 when unset — see src/data/apiClient.ts. */
  readonly VITE_API_BASE_URL?: string
  /** 'true' enables the dev screen switcher and `?screen=` deep links in non-dev builds. */
  readonly VITE_ENABLE_DEV_SCREEN_SWITCHER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
