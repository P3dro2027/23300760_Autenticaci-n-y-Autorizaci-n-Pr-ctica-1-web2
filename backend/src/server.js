require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const { JWT_SECRET, PORT = 3000, CORS_ORIGIN = 'http://localhost:4200' } = process.env;

if (!JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env');
  process.exit(1);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Hash de relleno: se compara aunque el usuario no exista para no revelar qué correos están registrados
const HASH_FALSO = bcrypt.hashSync('relleno-para-igualar-tiempos', 10);

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '10kb' }));

// Middleware: valida el JWT del encabezado Authorization: Bearer <token>
function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'Se requiere iniciar sesión.' });
  }
  try {
    req.usuario = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch {
    res.status(401).json({ mensaje: 'La sesión es inválida o expiró.' });
  }
}

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { correo, contrasena } = req.body ?? {};

  if (typeof correo !== 'string' || typeof contrasena !== 'string' || !correo.trim() || !contrasena) {
    return res.status(400).json({ mensaje: 'El correo y la contraseña son obligatorios.' });
  }
  if (!EMAIL_REGEX.test(correo.trim())) {
    return res.status(400).json({ mensaje: 'El correo no tiene un formato válido.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT correo, nombre, contrasena, rol FROM usuarios WHERE correo = $1',
      [correo.trim().toLowerCase()]
    );
    const usuario = rows[0];
    const coincide = await bcrypt.compare(contrasena, usuario ? usuario.contrasena : HASH_FALSO);

    if (!usuario || !coincide) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    // Sesión de 1 hora (RQF3 / RQNF2)
    const token = jwt.sign({ nombre: usuario.nombre, rol: usuario.rol }, JWT_SECRET, {
      subject: usuario.correo,
      expiresIn: '1h',
      algorithm: 'HS256',
    });

    res.json({ token, correo: usuario.correo, nombre: usuario.nombre, rol: usuario.rol });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

// GET /api/auth/me  -> datos registrados del usuario autenticado
app.get('/api/auth/me', verificarToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT correo, nombre, rol FROM usuarios WHERE correo = $1',
      [req.usuario.sub]
    );
    if (!rows[0]) return res.status(401).json({ mensaje: 'El usuario ya no existe.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`));
