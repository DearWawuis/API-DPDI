require('dotenv').config();
const mysql = require('mysql2');

// Configurar el pool de conexiones a MySQL (con los datos de AWS)
const pool = mysql.createPool({

  //Conexión a bd en Railway
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  
  waitForConnections: true,     // Esperar si todas las conexiones están ocupadas
  connectionLimit: 50,          // Número máximo de conexiones en el pool
  queueLimit: 0,                // Número máximo de consultas en la cola (0 significa sin límite)
  ssl: {
    rejectUnauthorized: false    // Habilitar SSL
  }
});

// Probar la conexión al pool
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error obteniendo una conexión del pool: ', err);
    return;
  }
  console.log('Conexión exitosa al pool de MySQL.');
  
  // Liberar la conexión de vuelta al pool
  connection.release();
});

module.exports = pool;
