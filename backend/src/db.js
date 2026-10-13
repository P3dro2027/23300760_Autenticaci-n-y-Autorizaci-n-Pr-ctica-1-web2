require('dotenv').config();
const { Pool } = require('pg');

// pg toma PGHOST, PGPORT, PGUSER, PGPASSWORD y PGDATABASE del entorno (.env)
const pool = new Pool();

module.exports = pool;
