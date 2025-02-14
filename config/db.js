import mysql from 'mysql2/promise.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' ?? '.env' });
// dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

export default pool;