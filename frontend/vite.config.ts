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
    // Permite servir el frontend bajo el dominio del despliegue (y sus subdominios).
    allowedHosts: ['.62344037.xyz'],
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3000',
      '/temp': 'http://localhost:3001'
    }
  },
  // vite preview (sirve el build) con las mismas reglas, para exponer el dist a internet.
  preview: {
    host: true,
    allowedHosts: ['.62344037.xyz'],
  }
})
