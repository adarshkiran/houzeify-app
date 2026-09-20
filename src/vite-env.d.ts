/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the 12E/12D backend API (e.g. http://localhost:4000).
   *  Falls back to http://localhost:4000 when unset — see src/data/apiClient.ts. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
