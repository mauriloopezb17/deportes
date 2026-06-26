-- =====================================================
-- BASE DE DATOS PARA GESTIÓN DEPORTIVA
-- =====================================================

-- =====================================================
-- 1. TABLAS PRINCIPALES
-- =====================================================

-- Tabla de carreras
CREATE TABLE IF NOT EXISTS carrera (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

-- Tabla de disciplinas (fútbol, básquet, vóley, etc.)
CREATE TABLE IF NOT EXISTS disciplina (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

-- Tabla de personas (con email validado)
CREATE TABLE IF NOT EXISTS persona (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    carnet VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    celular VARCHAR(20) NOT NULL,
    password VARCHAR(255),
    CONSTRAINT email_ucb CHECK (email LIKE '%@ucb.edu.bo')
);

-- Tabla de roles
CREATE TABLE IF NOT EXISTS rol (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(20) UNIQUE NOT NULL
);

-- =====================================================
-- 2. TABLAS DE RELACIONES
-- =====================================================

-- Persona - Rol (una persona puede tener múltiples roles)
CREATE TABLE IF NOT EXISTS persona_rol (
    persona_id INT NOT NULL REFERENCES persona(id) ON DELETE CASCADE,
    rol_id INT NOT NULL REFERENCES rol(id),
    PRIMARY KEY (persona_id, rol_id)
);

-- Delegado por carrera (uno por carrera)
CREATE TABLE IF NOT EXISTS delegado_carrera (
    persona_id INT NOT NULL UNIQUE REFERENCES persona(id) ON DELETE CASCADE,
    carrera_id INT NOT NULL UNIQUE REFERENCES carrera(id),
    PRIMARY KEY (persona_id, carrera_id)
);

-- Equipos (uno por carrera y disciplina)
CREATE TABLE IF NOT EXISTS equipo (
    id SERIAL PRIMARY KEY,
    nombre_equipo VARCHAR(100) NOT NULL,
    carrera_id INT NOT NULL REFERENCES carrera(id) ON DELETE CASCADE,
    disciplina_id INT NOT NULL REFERENCES disciplina(id) ON DELETE CASCADE,
    UNIQUE(carrera_id, disciplina_id)
);

-- Jugadores en equipos
CREATE TABLE IF NOT EXISTS jugador_equipo (
    jugador_id INT NOT NULL REFERENCES persona(id) ON DELETE CASCADE,
    equipo_id INT NOT NULL REFERENCES equipo(id) ON DELETE CASCADE,
    PRIMARY KEY (jugador_id, equipo_id)
);

-- =====================================================
-- 3. TABLAS DE TORNEOS Y FIXTURES
-- =====================================================

-- Torneos
CREATE TABLE IF NOT EXISTS torneo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('Interno', 'Externo')),
    disciplina_id INT NOT NULL REFERENCES disciplina(id) ON DELETE CASCADE,
    fecha_inicio DATE,
    fecha_fin DATE,
    imagen_url TEXT
);

-- Equipos participantes en torneo
CREATE TABLE IF NOT EXISTS torneo_equipo (
    torneo_id INT NOT NULL REFERENCES torneo(id) ON DELETE CASCADE,
    equipo_id INT NOT NULL REFERENCES equipo(id) ON DELETE CASCADE,
    PRIMARY KEY (torneo_id, equipo_id)
);

-- Fixture (partidos)
CREATE TABLE IF NOT EXISTS fixture (
    id SERIAL PRIMARY KEY,
    torneo_id INT NOT NULL REFERENCES torneo(id) ON DELETE CASCADE,
    ronda INT NOT NULL,
    equipo_local_id INT REFERENCES equipo(id),
    equipo_visitante_id INT REFERENCES equipo(id),
    fecha_hora TIMESTAMP,
    estadio VARCHAR(100),
    resultado_local INT,
    resultado_visitante INT,
    next_match_id INT REFERENCES fixture(id) NULL
);

-- Canchas deportivas
CREATE TABLE IF NOT EXISTS cancha (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(150) DEFAULT '',
    capacidad INT DEFAULT 0,
    tipo_superficie VARCHAR(80) DEFAULT '',
    estado VARCHAR(20) DEFAULT 'disponible'
);

-- Reservas de canchas
CREATE TABLE IF NOT EXISTS reserva (
    id SERIAL PRIMARY KEY,
    cancha_id INT NOT NULL REFERENCES cancha(id) ON DELETE CASCADE,
    equipo_id INT REFERENCES equipo(id) ON DELETE SET NULL,
    fecha DATE NOT NULL,
    hora_inicio VARCHAR(10) NOT NULL,
    hora_fin VARCHAR(10) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    observaciones TEXT
);

-- =====================================================
-- 4. TRIGGER PARA VALIDAR QUE UN JUGADOR SOLO JUEGUE EN UNA CARRERA
-- =====================================================

CREATE OR REPLACE FUNCTION validar_misma_carrera()
RETURNS TRIGGER AS $$
DECLARE
    carrera_jugador INT;
BEGIN
    -- Obtener la carrera del jugador a través del equipo
    SELECT e.carrera_id INTO carrera_jugador
    FROM equipo e
    WHERE e.id = NEW.equipo_id;
    
    -- Verificar si el jugador ya pertenece a otra carrera
    IF EXISTS (
        SELECT 1 
        FROM jugador_equipo je
        JOIN equipo e2 ON je.equipo_id = e2.id
        WHERE je.jugador_id = NEW.jugador_id
        AND e2.carrera_id != carrera_jugador
    ) THEN
        RAISE EXCEPTION 'Un jugador no puede participar en equipos de diferentes carreras';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_validar_misma_carrera ON jugador_equipo;

-- Crear trigger
CREATE TRIGGER trigger_validar_misma_carrera
BEFORE INSERT ON jugador_equipo
FOR EACH ROW
EXECUTE FUNCTION validar_misma_carrera();

-- =====================================================
-- 5. DATOS INICIALES
-- =====================================================

-- Insertar roles básicos
INSERT INTO rol (nombre) VALUES 
    ('Administrador'),
    ('Jugador'),
    ('Delegado')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar disciplinas de ejemplo
INSERT INTO disciplina (nombre) VALUES 
    ('Fútbol'),
    ('Básquetbol'),
    ('Vóley')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO cancha (nombre, ubicacion, capacidad, tipo_superficie, estado) VALUES
    ('Cancha Principal', 'Campus universitario', 100, 'Cesped', 'disponible')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5.1. DATOS DE PRUEBA - USUARIOS Y ROLES
-- =====================================================

-- Crear carreras de prueba
INSERT INTO carrera (nombre) VALUES 
    ('Ingeniería de Sistemas'),
    ('Ingeniería Comercial'),
    ('Administración de Empresas')
ON CONFLICT (nombre) DO NOTHING;

-- Crear usuarios de prueba
-- Usuario Admin: admin@ucb.edu.bo / admin123
-- Usuario Jugador: jugador@ucb.edu.bo / jugador123
-- Usuario Delegado: delegado@ucb.edu.bo / delegado123
INSERT INTO persona (nombre, apellido, carnet, email, celular, password) VALUES 
    ('Admin', 'Sistema', '10000001', 'admin@ucb.edu.bo', '76000001', '$2b$10$YOixZDBKVvUQzV5YJlVKuOkVP8Jg1VV3NvAFXvBzKfB2D7g2E2Z5e'),
    ('Juan', 'Pérez', '10000002', 'jugador@ucb.edu.bo', '76000002', '$2b$10$YOixZDBKVvUQzV5YJlVKuOkVP8Jg1VV3NvAFXvBzKfB2D7g2E2Z5e'),
    ('Carlos', 'López', '10000003', 'delegado@ucb.edu.bo', '76000003', '$2b$10$YOixZDBKVvUQzV5YJlVKuOkVP8Jg1VV3NvAFXvBzKfB2D7g2E2Z5e')
ON CONFLICT (email) DO NOTHING;

UPDATE persona SET password = '$2b$10$fBwa311m7zEsfx28lh5IQu9Ue8l8D0l0tlYPnHzw/hbwhpTj8z4hO' WHERE email = 'admin@ucb.edu.bo';
UPDATE persona SET password = '$2b$10$e8h1AuXHn0C9.surrOORBeL0.l56JvpOkGFUqdYhAs8M.DXiF8qka' WHERE email = 'jugador@ucb.edu.bo';
UPDATE persona SET password = '$2b$10$flwBHGGDxHVDH/SpmLjGAeXTKp89ex/dfrjYR8H12b9Zw1inSXA82' WHERE email = 'delegado@ucb.edu.bo';

-- Asignar roles a usuarios
INSERT INTO persona_rol (persona_id, rol_id) 
SELECT p.id, r.id FROM persona p, rol r 
WHERE p.email = 'admin@ucb.edu.bo' AND r.nombre = 'Administrador'
ON CONFLICT DO NOTHING;

INSERT INTO persona_rol (persona_id, rol_id) 
SELECT p.id, r.id FROM persona p, rol r 
WHERE p.email = 'jugador@ucb.edu.bo' AND r.nombre = 'Jugador'
ON CONFLICT DO NOTHING;

INSERT INTO persona_rol (persona_id, rol_id) 
SELECT p.id, r.id FROM persona p, rol r 
WHERE p.email = 'delegado@ucb.edu.bo' AND r.nombre = 'Delegado'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_persona_email ON persona(email);
CREATE INDEX IF NOT EXISTS idx_persona_carnet ON persona(carnet);
CREATE INDEX IF NOT EXISTS idx_equipo_carrera ON equipo(carrera_id);
CREATE INDEX IF NOT EXISTS idx_equipo_disciplina ON equipo(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_jugador_equipo_jugador ON jugador_equipo(jugador_id);
CREATE INDEX IF NOT EXISTS idx_jugador_equipo_equipo ON jugador_equipo(equipo_id);
CREATE INDEX IF NOT EXISTS idx_fixture_torneo ON fixture(torneo_id);
CREATE INDEX IF NOT EXISTS idx_torneo_disciplina ON torneo(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_reserva_cancha ON reserva(cancha_id);
CREATE INDEX IF NOT EXISTS idx_reserva_equipo ON reserva(equipo_id);
CREATE INDEX IF NOT EXISTS idx_reserva_fecha ON reserva(fecha);
