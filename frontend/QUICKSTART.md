```
╔════════════════════════════════════════════════════════════════════╗
║                   🚀 QUICK START GUIDE                            ║
║           Frontend Gestión Deportiva - React + TypeScript         ║
╚════════════════════════════════════════════════════════════════════╝

📋 TABLA DE CONTENIDOS
═══════════════════════════════════════════════════════════════════════
1. Instalación Rápida
2. Estructura del Proyecto
3. Características Principales
4. Comandos Útiles
5. Configuración
6. Ejemplos de Uso


🔧 1. INSTALACIÓN RÁPIDA
═══════════════════════════════════════════════════════════════════════

Paso 1: Instalar dependencias
────────────────────────────
  cd Frontend
  npm install

Paso 2: Configurar variables de entorno
────────────────────────────────────────
  cp .env.example .env
  # Editar .env si es necesario

Paso 3: Iniciar servidor de desarrollo
──────────────────────────────────────
  npm run dev

  ✅ Abre http://localhost:3000


📦 2. ESTRUCTURA DEL PROYECTO
═══════════════════════════════════════════════════════════════════════

Frontend/
├── src/
│   ├── components/        ← Componentes React
│   ├── pages/            ← Páginas de la app
│   ├── services/         ← Llamadas a la API
│   ├── store/            ← Zustand state
│   ├── types/            ← Tipos TypeScript
│   ├── utils/            ← Funciones auxiliares
│   ├── hooks/            ← Custom hooks
│   ├── App.tsx           ← Rutas principales
│   └── main.tsx          ← Punto de entrada
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js


⭐ 3. CARACTERÍSTICAS PRINCIPALES
═══════════════════════════════════════════════════════════════════════

✅ AUTENTICACIÓN
   • Login con JWT
   • Control de roles (ADMIN, DELEGADO, ENTRENADOR, JUGADOR)
   • Rutas protegidas

✅ GESTIÓN DE EQUIPOS
   • Crear, editar, eliminar equipos
   • Inscripción de jugadores
   • Estados: registrado, confirmado, descalificado

✅ RESERVAS DE CANCHAS
   • Calendario dinámico
   • Visualización de disponibilidad
   • Confirmación de reservas

✅ TORNEOS & COMPETENCIAS
   • Gestión de torneos
   • Registro de resultados
   • Estados de partidos

✅ PANEL ADMINISTRATIVO
   • Gestión de academias
   • Verificación de pagos
   • Comunicados e historial

✅ DISEÑO
   • Responsive (móvil, tablet, desktop)
   • Tailwind CSS con colores personalizados
   • Componentes reutilizables
   • Animaciones suaves
   • Iconos con Lucide React


💻 4. COMANDOS ÚTILES
═══════════════════════════════════════════════════════════════════════

Desarrollo
──────────
npm run dev              # Iniciar servidor desarrollo (puerto 3000)

Build
────
npm run build            # Build para producción
npm run preview          # Ver preview del build

Linting
───────
npm run lint             # Validar código con ESLint


⚙️ 5. CONFIGURACIÓN
═══════════════════════════════════════════════════════════════════════

Variables de Entorno (.env)
───────────────────────────
VITE_API_URL=http://localhost:3001/api


Credenciales de Prueba
──────────────────────
Email:    admin@example.com
Password: password123


Puertos
───────
Frontend: http://localhost:3000
Backend:  http://localhost:3001
API:      http://localhost:3001/api


🎯 6. EJEMPLOS DE USO
═══════════════════════════════════════════════════════════════════════

EJEMPLO 1: Obtener Lista de Equipos
────────────────────────────────────
import { useEquipoStore } from '@store/equipoStore';

const MyComponent = () => {
  const { equipos, obtenerEquipos } = useEquipoStore();

  useEffect(() => {
    obtenerEquipos();
  }, []);

  return (
    <div>
      {equipos.map(equipo => (
        <div key={equipo.id}>{equipo.nombre}</div>
      ))}
    </div>
  );
};


EJEMPLO 2: Crear un Equipo
──────────────────────────
const { crearEquipo } = useEquipoStore();

const handleCreate = async () => {
  try {
    await crearEquipo({
      nombre: 'Equipo Nuevo',
      categoria: '2024'
    });
    // Equipo creado exitosamente
  } catch (error) {
    console.error('Error:', error);
  }
};


EJEMPLO 3: Verificar Rol del Usuario
────────────────────────────────────
import { useAuthStore } from '@store/authStore';
import { UserRole } from '@types/index';

const MyComponent = () => {
  const { hasRole } = useAuthStore();

  if (hasRole(UserRole.ADMIN)) {
    return <AdminPanel />;
  }

  return <UserView />;
};


EJEMPLO 4: Usar Componentes Comunes
────────────────────────────────────
import { Button, Input, Modal, Card } from '@components/common';

const MyForm = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <Input
        label="Nombre"
        type="text"
        placeholder="Ingresa el nombre"
      />
      <Button
        variant="primary"
        onClick={() => setIsOpen(true)}
      >
        Abrir Modal
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Ejemplo Modal"
      >
        Contenido del modal
      </Modal>
    </Card>
  );
};


EJEMPLO 5: Agregar Nueva Página
──────────────────────────────
1. Crear src/pages/MyNewPage.tsx
2. Agregar ruta en src/App.tsx
3. Agregar en navegación (Sidebar)

// src/pages/MyNewPage.tsx
import React from 'react';
import { Layout } from '@components/layout';

const MyNewPage: React.FC = () => {
  return (
    <Layout>
      <h1>Mi Nueva Página</h1>
    </Layout>
  );
};

export default MyNewPage;


🔗 INTEGRACIÓN CON BACKEND
═══════════════════════════════════════════════════════════════════════

Requisitos
──────────
✅ Backend corriendo en http://localhost:3001
✅ CORS configurado
✅ Base de datos con datos

Iniciar Backend
───────────────
# En la carpeta raíz
npm run start:dev

Verificar Conexión
──────────────────
1. Abre DevTools (F12)
2. Va a pestaña Network
3. Intenta hacer login
4. Deberías ver petición POST /auth/login


📱 RUTAS DISPONIBLES
═══════════════════════════════════════════════════════════════════════

Pública
───────
/login                  Login página

Protegidas (requieren autenticación)
────────────────────────────────────
/dashboard              Dashboard principal
/equipos                Gestión de equipos
/jugadores              Gestión de jugadores
/reservas               Reserva de canchas
/torneos                Gestión de torneos
/resultados             Resultados de partidos
/admin                  Panel administrativo (solo ADMIN)
/cms                    CMS de contenidos (solo ADMIN)


🎨 TEMAS & COLORES
═══════════════════════════════════════════════════════════════════════

Colores Primarios
─────────────────
primary-600     bg-primary-600      Azul principal
secondary-600   bg-secondary-600    Púrpura secundario
gray-900        text-gray-900       Texto oscuro
red-600         bg-red-600          Rojo (peligro)
green-600       bg-green-600        Verde (éxito)

Clases Tailwind Personalizadas
──────────────────────────────
bg-primary-600  hover:bg-primary-700
text-primary-600
border-primary-200


📚 DOCUMENTACIÓN ADICIONAL
═══════════════════════════════════════════════════════════════════════

README.md           Información general del proyecto
DEVELOPMENT.md      Guía de desarrollo
ARCHITECTURE.md     Arquitectura y patrones
INTEGRATION.md      Integración Backend-Frontend
COMPLETE_SUMMARY.md Resumen completo


🚨 SOLUCIÓN DE PROBLEMAS
═══════════════════════════════════════════════════════════════════════

❌ Error: Cannot connect to API
→ Verifica que el backend esté corriendo (port 3001)
→ Revisa VITE_API_URL en .env

❌ Error: 401 Unauthorized
→ Limpia localStorage en DevTools
→ Intenta login de nuevo

❌ Error: CORS error
→ Verifica CORS en backend
→ Asegúrate que origin es http://localhost:3000

❌ Página en blanco
→ Abre DevTools (F12)
→ Ve a pestaña Console
→ Lee los errores


✨ PRÓXIMAS ACCIONES
═══════════════════════════════════════════════════════════════════════

1. ✅ Instalar dependencias: npm install
2. ✅ Iniciar servidor: npm run dev
3. ✅ Ir a http://localhost:3000
4. ✅ Hacer login con credenciales de prueba
5. ✅ Explorar las diferentes secciones
6. ✅ Empezar a desarrollar nuevas features


🎉 ¡LISTO!
═══════════════════════════════════════════════════════════════════════

Tu Frontend está completamente configurado y listo para:
✅ Desarrollo
✅ Testing
✅ Integración con Backend
✅ Deploy a producción

¿Necesitas ayuda?
→ Revisa la documentación en README.md, DEVELOPMENT.md, ARCHITECTURE.md
→ Verifica INTEGRATION.md para conectar con el Backend
→ Consulta la consola del navegador para errores


═══════════════════════════════════════════════════════════════════════
                         ¡Bienvenido! 🚀
═══════════════════════════════════════════════════════════════════════
```
