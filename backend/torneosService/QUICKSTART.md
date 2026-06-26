# Guía Rápida de Inicio

## Con Docker (Recomendado)

### 1. Iniciar PostgreSQL con Docker
```bash
docker-compose up -d
```

Esto iniciará PostgreSQL y ejecutará el script de inicialización automáticamente.

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Por defecto, Docker usa:
- DB_HOST=localhost
- DB_PORT=5432
- DB_USER=postgres
- DB_PASS=postgres
- DB_NAME=gestion_deportiva

### 4. Iniciar la aplicación
```bash
npm run start:dev
```

### 5. Acceder a la API
- API: http://localhost:5173
- Swagger: http://localhost:3005/api

---

## Sin Docker (PostgreSQL local)

### 1. Crear base de datos
```bash
createdb gestion_deportiva
```

### 2. Ejecutar script SQL
```bash
psql -U postgres -d gestion_deportiva -f database.sql
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Configurar .env
```bash
cp .env.example .env
```

Ajusta los valores según tu configuración local.

### 5. Iniciar la aplicación
```bash
npm run start:dev
```

---

## Verificar que todo funciona

### 1. Ver logs de la aplicación
Deberías ver algo como:
```
[Nest] 12345 - 05/01/2024, 10:30:45 AM   LOG [NestFactory] Starting Nest application...
[Nest] 12345 - 05/01/2024, 10:30:46 AM   LOG [InstanceLoader] DatabaseModule dependencies initialized...
Aplicación corriendo en: http://localhost:5173
Swagger disponible en: http://localhost:3005/api
```

### 2. Probar login en Swagger
- Ve a http://localhost:3005/api
- Busca `POST /auth/register`
- Crea un usuario de prueba
- Usa `POST /auth/login` para obtener un token JWT
- Usa ese token en otros endpoints

### 3. Parar PostgreSQL (Docker)
```bash
docker-compose down
```

Para eliminar el volumen de datos:
```bash
docker-compose down -v
```

---

## Comandos Útiles

```bash
# Ver logs de Docker
docker-compose logs -f postgres

# Acceder a PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d gestion_deportiva

# Compilar el proyecto
npm run build

# Ejecutar en modo producción
npm start

# Ver estructura de tablas
docker-compose exec postgres psql -U postgres -d gestion_deportiva -c "\dt"
```

---

## Solución de Problemas

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
- Verifica que PostgreSQL esté corriendo
- Con Docker: `docker-compose up -d`
- Sin Docker: `psql --version` y inicia el servicio

### Error: "database gestion_deportiva does not exist"
- Con Docker: el database.sql se ejecuta automáticamente
- Sin Docker: ejecuta `psql -U postgres -d gestion_deportiva -f database.sql`

### Error: "password authentication failed"
- Verifica las credenciales en .env
- Por defecto: user=postgres, password=postgres

---

## Próximos pasos

1. Lee la documentación en [README.md](README.md)
2. Revisa los ejemplos de API en [API_EXAMPLES.md](API_EXAMPLES.md)
3. Consulta Swagger en http://localhost:3005/api
4. Revisa la estructura del código en src/