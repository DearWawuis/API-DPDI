import app from "../app";
import dotenv from "dotenv";
const db = require('./models/Db.model'); // Conexión a la base de datos

dotenv.config();
app.listen(3000, 'o.o.o.o', () =>{
    console.log('Servidor corriendo en http://0.0.0.0:3000');
})
