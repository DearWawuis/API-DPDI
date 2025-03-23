import jwt from 'jsonwebtoken';
import User from '../models/User.model';

// Validar si el token es válido
export const verifyToken = async (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(403).json({ message: "No se ha proporcionado ningún Token" });

    try {
        // Extraer la información del token
        const decoded = jwt.verify(token, process.env.SECRET);
        req.userId = decoded.id;
        console.log(decoded);

        // Buscar el usuario en la base de datos
        const user = await User.findById(req.userId, { password: 0 });
        console.log(user);

        // Validar si el usuario existe
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        // Continuar con la siguiente función si el usuario existe
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

export const authMiddleware = (req, res, next) => {
    try {
        // Obtener el token del encabezado de la solicitud
        const token = req.headers.authorization?.split(' ')[1]; // Formato: "Bearer <token>"
        if (!token) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        // Verificar el token
        const decoded = jwt.verify(token, process.env.SECRET);

        // Adjuntar el payload del token a la solicitud
        req.user = decoded;

        // Pasar al siguiente middleware o controlador
        next();
    } catch (error) {
        console.error("Error en authMiddleware:", error);
        res.status(401).json({ message: "Token inválido o expirado" });
    }
};

export const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ message: 'Acceso no autorizado' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token inválido' });
    }
  };