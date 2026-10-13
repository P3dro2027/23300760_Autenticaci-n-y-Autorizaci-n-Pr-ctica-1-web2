# Práctica 1 - Autenticación y Autorización (Angular 18 + Express + PostgreSQL)

Requisito: PostgreSQL instalado y una base de datos vacía llamada `login`.

## Backend (terminal 1)
cd backend
npm install
copy .env.example .env      (edita PGPASSWORD y JWT_SECRET)
npm run seed
npm start

## Frontend (terminal 2)
cd frontend
npm install
ng serve

Abre http://localhost:4200

Usuarios de prueba:
- admin@ejemplo.com   / Admin123    (admin)
- cliente@ejemplo.com / Cliente123  (cliente)
