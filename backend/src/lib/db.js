import mysql from 'mysql2/promise';

export function createConnectionPool() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Sj@25092002',
    database: process.env.DB_NAME || 'VillageComplaintResolutionSystem',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  return pool;
}


