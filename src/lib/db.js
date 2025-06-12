import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // SSL config za cloud baze
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
  // Uklanjam nevalidne opcije: acquireTimeout, timeout, reconnect
};

let pool;

export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export async function executeQuery(query, params = []) {
  try {
    const connection = await getConnection();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}