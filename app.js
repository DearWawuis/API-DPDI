import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './src/routes/auth.routes';
import photoRoutes from './src/routes/photo.routes';
import viewsRoutes from './src/routes/views.routes'; // Importar rutas de vistas
import connectDB from './src/config/db';

const app = express();

// Configura el tamaño máximo de la carga (aquí está configurado a 20MB)
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

// Configuración de CORS para permitir peticiones desde cualquier origen
const corsOptions = {
  origin: '*', // Permite solicitudes desde cualquier dominio
  methods: ['GET', 'POST', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
};

// Middleware para habilitar CORS
app.use(cors(corsOptions));

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', './src/views/'); // Carpeta donde están las vistas

// Middleware para servir archivos estáticos (CSS, JS, imágenes)
app.use(express.static('public'));

// Middleware para parsear cuerpos de solicitud como JSON
app.use(express.json());

// Conectar a la base de datos
connectDB();

// Rutas de la API
app.use('/api', authRoutes);
app.use('/api/photo', photoRoutes);

// Rutas para vistas
app.use('/', viewsRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.send('Control de Actividades API');
});

export default app;