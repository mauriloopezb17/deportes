# Guía de Desarrollo - Frontend

## Inicio Rápido

### 1. Instalar Dependencias

```bash
cd Frontend
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
VITE_API_URL=http://localhost:3005
```

### 3. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Accede a `http://localhost:5173`

## Credenciales de Prueba

Usa las credenciales de prueba del backend NestJS:

- **Email**: admin@example.com
- **Contraseña**: password123

## Estructura de Componentes

### Componentes Comunes (`src/components/common/`)

- **Button**: Botón reutilizable con variantes
- **Input**: Campo de entrada con validación
- **Select**: Dropdown selector
- **Modal**: Modal para diálogos
- **Alert**: Alertas de notificación
- **Card**: Tarjeta contenedora
- **Table**: Tabla de datos

### Componentes de Módulos

#### `src/components/layout/`

- Header con menú de usuario
- Sidebar con navegación
- Layout principal

#### `src/components/auth/`

- LoginForm
- ProtectedRoute

#### `src/components/team/`

- TeamList (CRUD de equipos)

#### `src/components/fields/`

- ReservationCalendar

#### `src/components/tournament/`

- TournamentList
- MatchResults

## State Management con Zustand

### Stores Disponibles

```typescript
import { useAuthStore } from "@store/authStore";
import { useEquipoStore } from "@store/equipoStore";
import { useTournamentStore } from "@store/tournamentStore";
import { useReservationStore } from "@store/reservationStore";
```

### Ejemplo de Uso

```typescript
const { usuario, logout, hasRole } = useAuthStore();

if (!hasRole(UserRole.ADMIN)) {
  // No tiene acceso
}
```

## Servicios de API

Los servicios están en `src/services/` y usan Axios:

```typescript
import { equipoService } from "@services/equipoService";
import { torneoService } from "@services/tournamentService";
import { reservaService } from "@services/fieldService";
```

### Ejemplo

```typescript
const response = await equipoService.obtenerEquipos({ page: 1, limit: 10 });
const equipo = await equipoService.obtenerEquipo(id);
```

## Tipos TypeScript

Los tipos están centralizados en `src/types/index.ts`:

```typescript
import { Equipo, Jugador, Reserva, Torneo, UserRole } from "@types/index";
```

## Rutas Protegidas

Las rutas están protegidas por rol:

```typescript
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

## Estilos con Tailwind CSS

El proyecto usa Tailwind CSS con colores personalizados:

- **primary**: Azul cielo
- **secondary**: Púrpura
- Colores estándar de Tailwind

### Ejemplo

```jsx
<div className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
  Botón personalizado
</div>
```

## Convenciones de Código

### Componentes

```typescript
// Usa componentes funcionales con hooks
const MyComponent: React.FC<Props> = ({ prop }) => {
  const [state, setState] = useState('');

  return <div>...</div>;
};

export default MyComponent;
```

### Naming

- Componentes: PascalCase (e.g., `TeamList.tsx`)
- Funciones: camelCase (e.g., `formatDate()`)
- Constantes: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

## Building

### Desarrollo

```bash
npm run dev
```

### Build para Producción

```bash
npm run build
```

### Vista Previa

```bash
npm run preview
```

## Troubleshooting

### Error: "Cannot find module"

Verifica los alias en `vite.config.ts` y `tsconfig.json`

### Error: "API not found"

Asegúrate que el backend esté corriendo en `http://localhost:3005`

### Token expirado

El token se guarda en localStorage y se envía automáticamente en cada request

## Próximas Features

- [ ] Módulo completo de jugadores
- [ ] CRUD de disciplinas
- [ ] Integración OAuth2
- [ ] Notificaciones en tiempo real
- [ ] Exportación de reportes
- [ ] Dark mode
- [ ] Búsqueda avanzada
- [ ] Paginación mejorada

## Testing (Futuro)

```bash
npm run test
npm run test:coverage
```

## Linting

```bash
npm run lint
```

## Recursos

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [Vite Guide](https://vitejs.dev)
