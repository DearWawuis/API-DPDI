const express = require('express');
const router = express.Router();
const { savePhoto, getAllPhotos, deletePhoto } = require('../controllers/photo.controller');
import { authenticate } from "../middlewares/authJwt";

// Ruta para guardar una foto
router.post('/photos', authenticate, savePhoto);

// Ruta para obtener todas las fotos
router.get('/photos', authenticate, getAllPhotos);

// Ruta para eliminar una foto
router.delete('/photos/:photoId', authenticate, deletePhoto);

module.exports = router;
