import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'app_db',
  port: 5432,
});

pool.on('connect', () => {
  console.log('🟢 Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('🔴 Erro no PostgreSQL:', err);
});

export default pool;