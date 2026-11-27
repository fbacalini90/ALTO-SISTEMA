const express = require('express');
const { rateLimit } = require('express-rate-limit');

const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

// Proteccion contra intentos reiterados de acceso

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        mensaje: 'Demasiados intentos. Intenta nuevamente en 15 minutos.'
    }
});

// Rutas de autenticacion

router.post(
    '/login',
    loginLimiter,
    authController.login
);

router.get(
    '/me',
    requireAuth,
    authController.me
);

router.post(
    '/logout',
    authController.logout
);

module.exports = router;