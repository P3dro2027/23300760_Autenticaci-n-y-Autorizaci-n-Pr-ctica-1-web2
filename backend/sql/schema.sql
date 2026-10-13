-- Base de datos: login  (crear antes con: CREATE DATABASE login;)

DO $$
BEGIN
  CREATE TYPE rol_usuario AS ENUM ('admin', 'cliente');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS usuarios (
  correo      VARCHAR(150) PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  contrasena  VARCHAR(255) NOT NULL,   -- hash bcrypt, nunca texto plano
  rol         rol_usuario  NOT NULL
);
