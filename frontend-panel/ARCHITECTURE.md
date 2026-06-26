# Arquitectura del Frontend

## Capas de la Aplicación

```
┌─────────────────────────────────────┐
│         Pages (Páginas)             │
│   LoginPage, Dashboard, TeamsPage   │
└─────────────────────────────────────┘
          ↓ (usa)
┌─────────────────────────────────────┐
│      Components (Componentes)       │
│  Layout, TeamList, Reservation...   │
└─────────────────────────────────────┘
          ↓ (usa)
┌─────────────────────────────────────┐
│    Store (Zustand State)            │
│  authStore, equipoStore, ...        │
└─────────────────────────────────────┘
          ↓ (usa)
┌─────────────────────────────────────┐
│      Services (API calls)           │
│  authService, equipoService, ...    │
└─────────────────────────────────────┘
          ↓ (usa)
┌─────────────────────────────────────┐
│    API Client (Axios)               │
│    Manejo de interceptores           │
└─────────────────────────────────────┘
          ↓ (conecta)
┌─────────────────────────────────────┐
│      Backend (NestJS)               │
│    http://localhost:3005            │
└─────────────────────────────────────┘
```

## Flujo de Datos

### 1. Autenticación

```
LoginForm
  ↓ (user input)
authStore.login()
  ↓ (dispatch)
authService.login(email, password)
  ↓ (request)
apiClient.post('/auth/login')
  ↓ (response)
localStorage (token saved)
  ↓
Navigate to Dashboard
```

### 2. Obtener Datos

```
useEffect on component mount
  ↓
equipoStore.obtenerEquipos()
  ↓
equipoService.obtenerEquipos()
  ↓
apiClient.getPaginated('/equipo')
  ↓
Render Table with data
```

### 3. Crear Entidad

```
Form submission
  ↓
store.crearEquipo(data)
  ↓
service.crearEquipo(data)
  ↓
apiClient.post('/equipo', data)
  ↓
Toast/Alert notificación
  ↓
Refrescar lista
```

## Gestión de Estado

### AuthStore

- `usuario`: Usuario actual
- `isAuthenticated`: Estado de sesión
- `login()`: Inicia sesión
- `logout()`: Cierra sesión
- `hasRole()`: Verifica roles

### EquipoStore

- `equipos[]`: Lista de equipos
- `equipo`: Equipo seleccionado
- `obtenerEquipos()`: GET /equipo
- `crearEquipo()`: POST /equipo
- `actualizarEquipo()`: PUT /equipo/:id
- `eliminarEquipo()`: DELETE /equipo/:id

### TournamentStore

- Similar a EquipoStore
- Incluye `partidos[]` para matches

### ReservationStore

- `reservas[]`: Lista de reservas
- `obtenerDisponibilidad()`: Horarios disponibles

## Patrones Utilizados

### 1. Componente Contenedor + Presentacional

```typescript
// Container
const EquipoList: React.FC = () => {
  const { equipos } = useEquipoStore();
  return <EquipoTable data={equipos} />;
};

// Presentacional
const EquipoTable: React.FC<Props> = ({ data }) => {
  return <table>...</table>;
};
```

### 2. Custom Hooks

```typescript
const { data, loading, error, execute } = useAsync(fetchData);
```

### 3. Protected Routes

```typescript
<ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
  <AdminPage />
</ProtectedRoute>
```

### 4. Form Control

```typescript
const [formData, setFormData] = useState({
  nombre: "",
  categoria: "",
});

const handleChange = (e) => {
  setFormData((prev) => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
};
```

## Performance Optimization

### 1. Code Splitting

Las rutas están lazy-loaded automáticamente por React Router

### 2. Memoization

```typescript
const MemoizedComponent = React.memo(MyComponent);
```

### 3. Lazy Loading

```typescript
const AdminPage = React.lazy(() => import("./AdminPage"));
```

## Error Handling

### 1. API Errors

```typescript
try {
  await equipoService.crearEquipo(data);
} catch (error) {
  const message = error.response?.data?.message || "Error desconocido";
  setError(message);
}
```

### 2. Auth Errors

Interceptores en `apiClient` manejan 401 automáticamente

### 3. Component Error Boundaries

(Implementar ErrorBoundary para futuras versiones)

## Seguridad

### 1. JWT Token

- Almacenado en localStorage
- Enviado en header `Authorization: Bearer <token>`

### 2. CORS

El servidor backend maneja CORS

### 3. Input Validation

- Validación en formularios
- Validación en el backend (fuente única de verdad)

## Escalabilidad

### Cómo Agregar un Nuevo Módulo

1. **Crear tipos** en `src/types/index.ts`
2. **Crear servicio** en `src/services/`
3. **Crear store** en `src/store/`
4. **Crear componentes** en `src/components/<module>/`
5. **Crear página** en `src/pages/`
6. **Agregar ruta** en `src/App.tsx`
7. **Agregar en sidebar** en `src/components/layout/Sidebar.tsx`

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

- Test componentes aislados
- Test hooks
- Test utilities

### Integration Tests

- Test flujos completos
- Test componentes + stores

### E2E Tests (Cypress)

- Test desde perspectiva del usuario
- Casos completos de negocio
