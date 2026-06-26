# Ejemplos de uso de la API Gestión Deportiva

## Base URL

```
http://localhost:3005
```

---

## ⚙️ CREDENCIALES DE PRUEBA

Usa estas credenciales para probar la API:

| Rol               | Email               | Contraseña  |
| ----------------- | ------------------- | ----------- |
| **Administrador** | admin@ucb.edu.bo    | admin123    |
| **Jugador**       | jugador@ucb.edu.bo  | jugador123  |
| **Delegado**      | delegado@ucb.edu.bo | delegado123 |

---

## AUTENTICACIÓN

### 1. Iniciar sesión (RECOMENDADO - Usa estas credenciales)

```bash
curl -X POST http://localhost:3005/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ucb.edu.bo",
    "password": "admin123"
  }'
```

Respuesta:

```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": 1,
    "nombre": "Admin",
    "apellido": "Sistema",
    "email": "admin@ucb.edu.bo",
    "roles": ["Administrador"]
  }
}
```

### 2. Registrar nuevo usuario

```bash
curl -X POST http://localhost:3005/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "carnet": "12345678",
    "email": "juan@ucb.edu.bo",
    "celular": "76543210",
    "password": "password123"
  }'
```

### 3. Iniciar sesión (usuario custom)

````bash
curl -X POST http://localhost:3005/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@ucb.edu.bo",
    "password": "password123"
  }'

Respuesta:
```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@ucb.edu.bo",
    "roles": ["Jugador"]
  }
}
````

### 3. Obtener perfil (requiere JWT)

```bash
curl -X GET http://localhost:3005/auth/profile \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## CARRERAS

### Listar todas las carreras

```bash
curl -X GET http://localhost:3005/carrera
```

### Crear carrera

```bash
curl -X POST http://localhost:3005/carrera \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "nombre": "Ingeniería de Sistemas"
  }'
```

### Obtener carrera por ID

```bash
curl -X GET http://localhost:3005/carrera/1 \
  -H "Authorization: Bearer eyJhbGc..."
```

### Actualizar carrera

```bash
curl -X PATCH http://localhost:3005/carrera/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "nombre": "Ingeniería Informática"
  }'
```

### Eliminar carrera

```bash
curl -X DELETE http://localhost:3005/carrera/1 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## DISCIPLINAS

### Listar disciplinas

```bash
curl -X GET http://localhost:3005/disciplina
```

### Crear disciplina

```bash
curl -X POST http://localhost:3005/disciplina \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "nombre": "Fútbol"
  }'
```

---

## PERSONAS

### Listar personas

```bash
curl -X GET http://localhost:3005/persona
```

### Crear persona

```bash
curl -X POST http://localhost:3005/persona \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "nombre": "Carlos",
    "apellido": "González",
    "carnet": "87654321",
    "email": "carlos@ucb.edu.bo",
    "celular": "72123456"
  }'
```

---

## ROLES

### Listar roles

```bash
curl -X GET http://localhost:3005/rol
```

### Crear rol

```bash
curl -X POST http://localhost:3005/rol \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "nombre": "Árbitro"
  }'
```

---

## PERSONA-ROL (Asignar roles a personas)

### Asignar rol a persona

```bash
curl -X POST http://localhost:3005/persona-rol \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "persona_id": 1,
    "rol_id": 2
  }'
```

### Obtener roles de una persona

```bash
curl -X GET http://localhost:3005/persona-rol/persona/1 \
  -H "Authorization: Bearer eyJhbGc..."
```

### Eliminar rol de persona

```bash
curl -X DELETE http://localhost:3005/persona-rol/1/2 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## EQUIPOS

### Listar equipos

```bash
curl -X GET http://localhost:3005/equipo
```

### Crear equipo

```bash
curl -X POST http://localhost:3005/equipo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "nombre_equipo": "Ingeniería FC",
    "carrera_id": 1,
    "disciplina_id": 1
  }'
```

### Obtener equipo por carrera y disciplina

```bash
curl -X GET http://localhost:3005/equipo/buscar/carrera/1/disciplina/1 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## JUGADORES-EQUIPOS

### Agregar jugador a equipo

```bash
curl -X POST http://localhost:3005/jugador-equipo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "jugador_id": 2,
    "equipo_id": 1
  }'
```

### Obtener jugadores de un equipo

```bash
curl -X GET http://localhost:3005/jugador-equipo/equipo/1 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## TORNEOS

### Listar torneos

```bash
curl -X GET http://localhost:3005/torneo
```

### Crear torneo

```bash
curl -X POST http://localhost:3005/torneo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "nombre": "Torneo Interno 2024",
    "tipo": "Interno",
    "disciplina_id": 1,
    "fecha_inicio": "2024-05-01",
    "fecha_fin": "2024-06-30"
  }'
```

---

## FIXTURES (PARTIDOS)

### Listar partidos

```bash
curl -X GET http://localhost:3005/fixture
```

### Crear partido

```bash
curl -X POST http://localhost:3005/fixture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "torneo_id": 1,
    "ronda": 1,
    "equipo_local_id": 1,
    "equipo_visitante_id": 2,
    "fecha_hora": "2024-05-15T15:00:00",
    "estadio": "Estadio Universitario"
  }'
```

### Actualizar resultado de partido

```bash
curl -X PATCH http://localhost:3005/fixture/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "resultado_local": 3,
    "resultado_visitante": 1
  }'
```

---

## TORNEO-EQUIPOS

### Agregar equipo a torneo

```bash
curl -X POST http://localhost:3005/torneo-equipo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "torneo_id": 1,
    "equipo_id": 1
  }'
```

### Obtener equipos de un torneo

```bash
curl -X GET http://localhost:3005/torneo-equipo/torneo/1 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## DOCUMENTACIÓN SWAGGER

Accede a: http://localhost:3005/api
