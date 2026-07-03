/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
  // เพิ่มตัวแปร env อื่นๆ ของคุณที่นี่ถ้ามี
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}