# 🔗 Integración Frontend-Backend

## Verificación Previa

Antes de ejecutar, asegúrate de que tu Backend NestJS esté:

1. ✅ Instalado: `npm install` en la carpeta raíz del Backend
2. ✅ Base de datos configurada (PostgreSQL corriendo)
3. ✅ Archivo `.env` del Backend configurado
4. ✅ Puerto 3001 disponible

## Pasos de Ejecución

### 1️⃣ Inicisr Backend (Terminal 1)

```bash
cd ..  # Volver a la carpeta raíz (GestionD)
npm run start:dev
# o
npm run dev
```

Deberías ver algo como:

```
[Nest] 12345 - 01/01/2024, 10:00:00 PM     LOG [NestFactory] Nest application successfully started +123ms
```

Backend corriendo en: **http://localhost:3005**

### 2️⃣ Iniciar Frontend (Terminal 2)

```bash
cd Frontend
npm install  # Si aún no instalaste dependencias
npm run dev
```

Deberías ver algo como:

```
Local:        http://localhost:5173/
```

Frontend corriendo en: **http://localhost:5173**

## Verificar Conexión

### 1. Abrir http://localhost:5173 en tu navegador

Deberías ver la página de login con el formulario.

### 2. Intentar Login

Usa las credenciales del backend:

- Email: `admin@example.com`
- Contraseña: `password123`

### 3. Si funciona, deberías:

✅ Ver el Dashboard
✅ Acceder a las diferentes secciones
✅ Ver datos del backend

## Troubleshooting

### Error: "Cannot connect to API"

**Problema**: El Backend no está corriendo

**Solución**:

```bash
# Terminal 1: Verificar que el backend está corriendo
lsof -i :3001  # MacOS/Linux
netstat -ano | findstr :3001  # Windows

# Si no está, iniciar:
npm run start:dev
```

### Error: "401 Unauthorized"

**Problema**: Token inválido o expirado

**Solución**:

```bash
# Limpiar localStorage en DevTools
# Console tab → localStorage.clear()

# Luego refrescar página y hacer login de nuevo
```

### Error: "CORS error"

**Problema**: Problema con CORS en el backend

**Solución**: Verificar en tu Backend que el CORS está configurado correctamente:

```typescript
// main.ts del Backend
app.enableCors({
  origin: "http://localhost:5173",
  credentials: true,
});
```

### Error: "Network error"

**Problema**: Mala configuración de VITE_API_URL

**Solución**: Verificar `.env`:

```env
VITE_API_URL=http://localhost:3005
```

Y reiniciar el servidor:

```bash
# Ctrl+C en la terminal de Frontend
npm run dev
```

### Error: "Page not found (404)"

**Problema**: Ruta no existe en el backend

**Solución**: Verificar que el endpoint existe en `src/` del backend

## API Endpoints Esperados

Tu Frontend espera estos endpoints del Backend:

### Autenticación

- `POST /auth/login` - Iniciar sesión
- `GET /auth/profile` - Obtener usuario actual

### Equipos

- `GET /equipo` - Listar equipos
- `POST /equipo` - Crear equipo
- `PUT /equipo/:id` - Actualizar equipo
- `DELETE /equipo/:id` - Eliminar equipo
- `GET /equipo/:id` - Obtener equipo específico
- `GET /equipo/academia/:id` - Equipos por academia

### Jugadores

- `GET /jugador` - Listar jugadores
- `POST /jugador` - Crear jugador
- `PUT /jugador/:id` - Actualizar jugador
- `DELETE /jugador/:id` - Eliminar jugador
- `GET /jugador-equipo/equipo/:id` - Jugadores de un equipo
- `POST /jugador-equipo` - Agregar jugador a equipo

### Canchas y Reservas

- `GET /cancha` - Listar canchas
- `POST /cancha` - Crear cancha
- `PUT /cancha/:id` - Actualizar cancha
- `DELETE /cancha/:id` - Eliminar cancha
- `GET /reserva` - Listar reservas
- `POST /reserva` - Crear reserva
- `PATCH /reserva/:id` - Actualizar reserva
- `GET /reserva/disponibilidad/:id/:fecha` - Horarios disponibles

### Torneos y Partidos

- `GET /torneo` - Listar torneos
- `POST /torneo` - Crear torneo
- `PUT /torneo/:id` - Actualizar torneo
- `DELETE /torneo/:id` - Eliminar torneo
- `GET /partido` - Listar partidos
- `POST /partido` - Crear partido
- `POST /partido/:id/resultado` - Registrar resultado
- `GET /partido/:id/resultado` - Obtener resultado

### Disciplinas

- `GET /disciplina` - Listar disciplinas
- `POST /disciplina` - Crear disciplina
- `PUT /disciplina/:id` - Actualizar disciplina
- `DELETE /disciplina/:id` - Eliminar disciplina

### Academias y Admin

- `GET /academia` - Listar academias
- `POST /academia` - Crear academia
- `PUT /academia/:id` - Actualizar academia
- `GET /academia/:id/pagos` - Pagos de academia
- `GET /pago` - Listar pagos
- `POST /pago` - Crear pago
- `PATCH /pago/:id` - Actualizar pago
- `GET /comunicado` - Listar comunicados
- `POST /comunicado` - Crear comunicado
- `PATCH /comunicado/:id` - Actualizar comunicado
- `GET /historial` - Historial del club
- `POST /historial` - Crear registro en historial

## Desarrollo vs Producción

### Desarrollo (Actual)

```bash
# Terminal 1: Backend
npm run start:dev

# Terminal 2: Frontend
npm run dev
```

URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:3005
- API: http://localhost:3005/api

### Producción

#### Backend Build:

```bash
npm run build
npm start
```

#### Frontend Build:

```bash
npm run build
```

Luego servir la carpeta `dist/` con un servidor web (Nginx, Apache, etc.)

## Variables de Entorno

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/gestion_deportiva
JWT_SECRET=tu_secret_key_aqui
NODE_ENV=development
PORT=3001
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3005
```

## Datos Simulados

Para pruebas rápidas, puedes usar los datos del archivo `database.sql`:

```bash
# En tu cliente de PostgreSQL
\i database.sql
```

## Checklist de Integración

- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 3000
- [ ] CORS configurado en Backend
- [ ] Variables de entorno correctas
- [ ] Base de datos poblada con datos
- [ ] Login funcional
- [ ] Dashboard carga correctamente
- [ ] Puedo crear/editar/eliminar equipos
- [ ] Las reservas funcionan
- [ ] Los torneos se crean correctamente

## Próximos Pasos

1. **Validar todos los módulos**
   - [ ] Equipos
   - [ ] Jugadores
   - [ ] Reservas
   - [ ] Torneos
   - [ ] Resultados
   - [ ] Admin

2. **Optimizaciones**
   - [ ] Caché de datos
   - [ ] Paginación mejorada
   - [ ] Búsqueda avanzada
   - [ ] Filtros dinámicos

3. **Pruebas**
   - [ ] Tests unitarios
   - [ ] Tests de integración
   - [ ] E2E tests

4. **Deploy**
   - [ ] Build para producción
   - [ ] Configurar servidor
   - [ ] SSL/TLS
   - [ ] CI/CD pipeline

## ¿Problemas?

1. Verifica los logs de ambos servidores
2. Abre DevTools del navegador (F12)
3. Ve a la pestaña Network y revisa las peticiones
4. Busca errores en la consola

## 🎉 ¡Listo para Desarrollo!

Si todo funciona, ¡estás listo para:

- Desarrollar nuevas características
- Integrar más módulos
- Preparar para producción

¡Buena suerte! 🚀
