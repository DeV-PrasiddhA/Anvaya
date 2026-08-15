import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Expose SUPABASE_* env vars to the browser bundle (in addition to VITE_*)
  envPrefix: ['VITE_', 'SUPABASE_'],
})
