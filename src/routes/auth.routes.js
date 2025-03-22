import { Router } from 'express';
const authController = require('../controllers/auth.controller');
const router = Router();
import { authMiddleware } from "../middlewares/authJwt";

// Ruta para registrar un usuario
router.post('/register', authController.register);

// Ruta para iniciar sesión
router.post('/login', authController.login);

// Ruta para verificar el correo
router.get('/verify/:confirmationCode', authController.verify);

// Ruta para eliminar una cuenta (protegida por autenticación)
router.delete('/delete-account', authMiddleware, authController.deleteAccount);

export default router;
