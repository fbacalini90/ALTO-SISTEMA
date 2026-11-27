const express = require('express');
const bcrypt = require('bcryptjs');
const { rateLimit } = require('express-rate-limit');
const { pool } = require('../config/database');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

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

router.post('/login', loginLimiter, async (req, res) => {
    const { usuario, password } = req.body || {};

    if (
        typeof usuario !== 'string' ||
        typeof password !== 'string' ||
        !usuario.trim() ||
        !password ||
        usuario.length > 50 ||
        Buffer.byteLength(password, 'utf8') > 72
    ) {
        return res.status(400).json({
            mensaje: 'Credenciales invalidas.'
        });
    }

    try {
        const [usuarios] = await pool.execute(
            `SELECT id, usuario, password_hash, activo
             FROM usuarios
             WHERE usuario = ?
             LIMIT 1`,
            [usuario.trim()]
        );

        if (usuarios.length === 0 || !usuarios[0].activo) {
            return res.status(401).json({
                mensaje: 'Usuario o contraseña incorrectos.'
            });
        }

        const administrador = usuarios[0];

        const passwordCorrecta = await bcrypt.compare(
            password,
            administrador.password_hash
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                mensaje: 'Usuario o contraseña incorrectos.'
            });
        }

        req.session.regenerate((error) => {
            if (error) {
                return res.status(500).json({
                    mensaje: 'No se pudo iniciar la sesion.'
                });
            }

            req.session.usuarioId = administrador.id;

            req.session.save((error) => {
                if (error) {
                    return res.status(500).json({
                        mensaje: 'No se pudo guardar la sesion.'
                    });
                }

                return res.json({
                    mensaje: 'Sesion iniciada correctamente.',
                    usuario: {
                        id: administrador.id,
                        usuario: administrador.usuario
                    }
                });
            });
        });

    } catch (error) {
        console.error('Error de login:', error.message);

        return res.status(500).json({
            mensaje: 'Error interno del servidor.'
        });
    }
});

router.get('/me', requireAuth, (req, res) => {
    res.json({
        autenticado: true,
        usuario: req.usuario
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'No se pudo cerrar la sesion.'
            });
        }

        res.clearCookie('alto.sid', {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });

        return res.json({
            mensaje: 'Sesion cerrada correctamente.'
        });
    });
});

module.exports = router;