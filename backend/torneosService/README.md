# Gestión Deportiva API - GestionD

API REST completa para gestionar competencias deportivas universitarias con autenticación JWT y documentación Swagger.

## Características

- CRUD completo para todas las entidades
- Autenticación JWT con roles
- Control de acceso basado en roles (RBAC)
- Validaciones con class-validator
- Documentación automática con Swagger
- Base de datos PostgreSQL con TypeORM
- Estructura modular de NestJS
- Relaciones entre entidades correctamente configuradas

## Entidades

- **Carrera**: Carreras universitarias
- **Disciplina**: Deportes (Fútbol, Básquetbol, Vóley)
- **Persona**: Usuarios del sistema
- **Rol**: Roles de acceso (Administrador, Jugador, Delegado)
- **PersonaRol**: Relación muchos a muchos entre Personas y Roles
- **DelegadoCarrera**: Delegado por carrera
- **Equipo**: Equipos por carrera y disciplina
- **JugadorEquipo**: Jugadores en equipos
- **Torneo**: Torneos deportivos
- **TorneoEquipo**: Equipos participantes en torneos
- **Fixture**: Partidos del torneo

## Instalación

### Requisitos previos

- Node.js (v14 o superior)
- PostgreSQL
- npm o yarn

### Pasos

1. **Clonar el repositorio**

```bash
cd gestionD
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de base de datos:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=tu_contraseña
DB_NAME=gestion_deportiva
JWT_SECRET=tu_clave_secreta_fuerte
```

4. **Crear la base de datos**

```bash
createdb gestion_deportiva
```

5. **Ejecutar migraciones (opcional si usas scripts SQL)**

```bash
psql -U postgres -d gestion_deportiva -f database.sql
```

6. **Iniciar la aplicación**

Desarrollo:

```bash
npm run start:dev
```

Producción:

```bash
npm run build
npm start
```

## API Endpoints

### Autenticación

- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar nuevo usuario
- `GET /auth/profile` - Obtener perfil (requiere JWT)

### Carreras

- `GET /carrera` - Listar todas
- `GET /carrera/:id` - Obtener por ID
- `POST /carrera` - Crear
- `PATCH /carrera/:id` - Actualizar
- `DELETE /carrera/:id` - Eliminar

### Disciplinas

- `GET /disciplina` - Listar todas
- `GET /disciplina/:id` - Obtener por ID
- `POST /disciplina` - Crear
- `PATCH /disciplina/:id` - Actualizar
- `DELETE /disciplina/:id` - Eliminar

### Personas

- `GET /persona` - Listar todas
- `GET /persona/:id` - Obtener por ID
- `POST /persona` - Crear
- `PATCH /persona/:id` - Actualizar
- `DELETE /persona/:id` - Eliminar

### Roles

- `GET /rol` - Listar todos
- `GET /rol/:id` - Obtener por ID
- `POST /rol` - Crear
- `PATCH /rol/:id` - Actualizar
- `DELETE /rol/:id` - Eliminar

### Equipos

- `GET /equipo` - Listar todos
- `GET /equipo/:id` - Obtener por ID
- `GET /equipo/buscar/carrera/:carreraId/disciplina/:disciplinaId` - Buscar por carrera y disciplina
- `POST /equipo` - Crear
- `PATCH /equipo/:id` - Actualizar
- `DELETE /equipo/:id` - Eliminar

### Torneos

- `GET /torneo` - Listar todos
- `GET /torneo/:id` - Obtener por ID
- `POST /torneo` - Crear
- `PATCH /torneo/:id` - Actualizar
- `DELETE /torneo/:id` - Eliminar

### Fixtures (Partidos)

- `GET /fixture` - Listar todos
- `GET /fixture/:id` - Obtener por ID
- `GET /fixture/torneo/:torneoId` - Obtener por torneo
- `POST /fixture` - Crear
- `PATCH /fixture/:id` - Actualizar
- `DELETE /fixture/:id` - Eliminar

### Relaciones

- `POST /persona-rol` - Asignar rol a persona
- `GET /persona-rol` - Listar relaciones
- `GET /persona-rol/persona/:personaId` - Obtener roles de persona
- `DELETE /persona-rol/:personaId/:rolId` - Eliminar rol de persona

## Documentación Swagger

Accede a la documentación interactiva:

```
http://localhost:3005/api
```

## Autenticación JWT

Todos los endpoints protegidos requieren un header de autorización:

```
Authorization: Bearer <tu_jwt_token>
```

Ejemplo:

```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:5173/auth/profile
```

## Control de Acceso por Roles

Algunos endpoints pueden estar restringidos a ciertos roles. Ejemplo:

```typescript
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrador')
findAll() {
  return this.service.findAll();
}
## Tecnologías

- **NestJS**: Framework Node.js
- **TypeORM**: ORM para TypeScript
- **PostgreSQL**: Base de datos
- **Passport JWT**: Autenticación
- **Swagger/OpenAPI**: Documentación
- **Class Validator**: Validaciones

## Variables de Entorno

```

DB_HOST - Host de PostgreSQL
DB_PORT - Puerto de PostgreSQL
DB_USER - Usuario de PostgreSQL
DB_PASS - Contraseña de PostgreSQL
DB_NAME - Nombre de la base de datos
JWT_SECRET - Clave secreta para JWT
NODE_ENV - Entorno (development/production)

````

## Scripts Disponibles

```bash
npm run start       # Iniciar producción
npm run start:dev   # Iniciar desarrollo con hot reload
npm run build       # Compilar TypeScript
````

## Licencia

MIT

## Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.
