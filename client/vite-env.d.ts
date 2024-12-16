/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string;
    readonly BROWSER: string;
    readonly GENERATE_SOURCEMAP: string;
    readonly BASE_URL: string;
    readonly VITE_BASE_PORT: string;
    readonly VITE_MAX_VM_COUNT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}