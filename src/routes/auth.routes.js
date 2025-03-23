import { Router } from 'express';
const authController = require('../controllers/auth.controller');
const router = Router();
import { authMiddleware } from "../middlewares/authJwt";
import { authenticate } from '../middlewares/authJwt';

// Ruta para registrar un usuario
router.post('/register', authController.register);

// Ruta para iniciar sesión
router.post('/login', authController.login);

// Ruta para eliminar una cuenta (protegida por autenticación)
router.delete('/delete-account', authMiddleware, authController.deleteAccount);

// Ruta para validar el token
router.get('/validate-token', authenticate, authController.validateToken);

export default router;
