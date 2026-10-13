const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const USUARIOS = [
  { correo: 'admin@ejemplo.com',   nombre: 'admin',   contrasena: 'Admin123',   rol: 'admin' },
  { correo: 'cliente@ejemplo.com', nombre: 'cliente', contrasena: 'Cliente123', rol: 'cliente' },
];

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8');
  await pool.query(schema);

  for (const u of USUARIOS) {
    const hash = await bcrypt.hash(u.contrasena, 10);
    await pool.query(
      `INSERT INTO usuarios (correo, nombre, contrasena, rol)
       VALUES ($1, $2, $3, $4::rol_usuario)
       ON CONFLICT (correo) DO UPDATE
         SET nombre = EXCLUDED.nombre,
             contrasena = EXCLUDED.contrasena,
             rol = EXCLUDED.rol`,
      [u.correo, u.nombre, hash, u.rol]
    );
    console.log(`Usuario listo: ${u.correo} (${u.rol})`);
  }
}

main()
  .catch((err) => {
    console.error('Error al ejecutar el seed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
