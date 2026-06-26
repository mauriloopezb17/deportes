# Frontend - Gestión Deportiva

Frontend moderno construido con React 18, TypeScript, Tailwind CSS y Zustand para el sistema de administración de eventos deportivos.

## Características

- ✅ **Autenticación**: Login con JWT
- ✅ **Control de Roles**: ADMIN, DELEGADO, ENTRENADOR, JUGADOR
- ✅ **Gestión de Equipos**: Crear, editar y eliminar equipos
- ✅ **Inscripción de Jugadores**: Gestión de jugadores y equipos
- ✅ **Reserva de Canchas**: Calendario dinámico con disponibilidad
- ✅ **Torneos**: Gestión de torneos y competencias
- ✅ **Resultados**: Registro de resultados de partidos
- ✅ **Panel Administrativo**: Para academias y gestión general
- ✅ **Diseño Responsivo**: Optimizado para móvil, tablet y desktop
- ✅ **Tailwind CSS**: Diseño moderno y consistente

## Stack Tecnológico

- **React 18**: Librería UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool rápido
- **Tailwind CSS**: Utilidades CSS
- **Zustand**: State management
- **React Router v6**: Enrutamiento
- **Axios**: Cliente HTTP
- **Lucide React**: Iconos

## Instalación

```bash
cd Frontend
npm install
```

## Desarrollo

```bash
npm run dev
```

Accede a `http://localhost:5173`

## Build para Producción

```bash
npm run build
npm run preview
```

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── auth/           # Autenticación
│   ├── common/         # Componentes reutilizables
│   ├── layout/         # Layout principal
│   ├── team/           # Componentes de equipos
│   ├── fields/         # Componentes de canchas
│   ├── tournament/     # Componentes de torneos
│   ├── player/         # Componentes de jugadores
│   └── admin/          # Panel administrativo
├── pages/              # Páginas de la aplicación
├── services/           # Servicios de API
├── store/              # Zustand stores
├── types/              # Tipos TypeScript
├── utils/              # Utilidades
├── hooks/              # Custom hooks
├── App.tsx             # Componente principal
└── main.tsx            # Punto de entrada

```

## Variables de Entorno

Crea un archivo `.env` en la raíz:

```env
VITE_API_URL=http://localhost:3005
```

## Roles y Permisos

- **ADMIN**: Acceso total
- **DELEGADO**: Gestión de equipos y jugadores
- **ENTRENADOR**: Gestión de equipos y jugadores
- **JUGADOR/ESTUDIANTE**: Visualización limitada

## Características por Módulo

### Equipos

- Registro de equipos para intercarreras
- Inscripción de jugadores
- Estados: registrado, confirmado, descalificado

### Reservas

- Calendario dinámico
- Visualización de disponibilidad
- Confirmación de reservas

### Torneos

- Gestión de torneos
- Inscripción de equipos
- Registro de resultados

### Panel Administrativo

- Gestión de academias
- Verificación de pagos
- Comunicados y historial
- Reportes y estadísticas

## Autenticación

El sistema utiliza JWT para autenticación. Los tokens se almacenan en localStorage.

## Desarrollo Futuro

- [ ] Módulo completo de jugadores
- [ ] Disciplinas (CRUD)
- [ ] Integración con Google OAuth
- [ ] Notificaciones en tiempo real
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Gráficos estadísticos avanzados
- [ ] Búsqueda y filtrado avanzado
- [ ] Dark mode
