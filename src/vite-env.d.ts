interface ImportMetaEnv {
  VITE_PLAY_AI_CODE: any;
  readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
