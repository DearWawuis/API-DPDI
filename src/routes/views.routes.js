const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller')

// Ruta para la verificación de la cuenta
router.get('/verify/:confirmationCode', authController.verify);

module.exports = router;