-- Script de configuración inicial para Animeto API
-- Ejecutar como superusuario de PostgreSQL

-- Crear base de datos
CREATE DATABASE animeto_db;

-- Crear usuario para la aplicación (opcional)
CREATE USER animeto_user WITH PASSWORD 'secure_password_here';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE animeto_db TO animeto_user;

-- Conectar a la base de datos
\c animeto_db;

-- Otorgar permisos en el esquema público
GRANT ALL ON SCHEMA public TO animeto_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO animeto_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO animeto_user;

-- Configurar permisos por defecto para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO animeto_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO animeto_user;

-- Habilitar extensión UUID (si no está habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Mensaje de confirmación
SELECT 'Base de datos animeto_db configurada correctamente' AS status;