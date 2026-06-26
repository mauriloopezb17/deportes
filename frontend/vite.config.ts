import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],

  server: {
    // Escucha en 0.0.0.0 -> accesible desde la red / internet sin tener que pasar --host.
    host: true,
    port: 5173,
    strictPort: true,
    // Permite servir el frontend bajo el dominio del despliegue (y sus subdominios).
    allowedHosts: ['.62344037.xyz'],
    proxy: {
      // /api relativo (p.ej. el CMS) sale al gateway remoto que maneja NGINX.
      '/api': { target: 'https://test.62344037.xyz', changeOrigin: true },
      '/uploads': 'http://localhost:3000',
      '/temp': 'http://localhost:3001'
    }
  },
  // vite preview (sirve el build) con las mismas reglas, para exponer el dist a internet.
  preview: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ['.62344037.xyz'],
  }
})
