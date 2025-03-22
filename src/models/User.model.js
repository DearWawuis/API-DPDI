const pool = require('./Db.model'); // Importa el pool en lugar de una conexión directa

// Buscar usuario por correo
exports.findByEmail = (email, callback) => {
  const sql = 'SELECT * FROM usuarios WHERE correo = ?';
  
  // Usamos el pool para ejecutar la consulta
  pool.query(sql, [email], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Crear un nuevo usuario
exports.create = (name, email, hashedPassword, callback) => {
  const sql = 'INSERT INTO usuarios (nombre, correo, contrasena, verificado, token_verificacion) VALUES (?, ?, ?, ?, ?)';
  const confirmationCode = require('crypto').randomBytes(32).toString('hex'); // Código de confirmación
  
  // Usamos el pool para ejecutar la consulta
  pool.query(sql, [name, email, hashedPassword, false, confirmationCode], (err, result) => {
    if (err) return callback(err);
    callback(null, result, confirmationCode); // Devolvemos el confirmationCode para el correo de verificación
  });
};

// Activar usuario
exports.activateUser = (confirmationCode, callback) => {
  const sql = 'UPDATE usuarios SET verificado = 1, token_verificacion = NULL, fecha_verificacion = NOW() WHERE token_verificacion = ?';
  
  // Usamos el pool para ejecutar la consulta
  pool.query(sql, [confirmationCode], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

exports.deleteById = (userId, callback) => {
  const sql = 'DELETE FROM usuarios WHERE id = ?'; // Asegúrate de que la columna se llame "id"
  
  // Usamos el pool para ejecutar la consulta
  pool.query(sql, [userId], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};