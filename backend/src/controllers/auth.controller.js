const { APP_CONFIG } = require('../config/app.config');
const authService = require('../services/auth.service');

/* INICIO DE SESION */

async function login(req, res) {
    const { usuario, password } = req.body || {};

    try {
        const administrador = await authService.autenticar(
            usuario,
            password
        );

        req.session.regenerate((error) => {
            if (error) {
                return res.status(500).json({
                    mensaje: 'No se pudo iniciar la sesión.'
                });
            }

            req.session.usuarioId = administrador.id;

            req.session.save((error) => {
                if (error) {
                    return res.status(500).json({
                        mensaje: 'No se pudo guardar la sesión.'
                    });
                }

                return res.json({
                    mensaje: 'Sesión iniciada correctamente.',
                    usuario: administrador
                });
            });
        });

    } catch (error) {
        if (error instanceof authService.AuthError) {
            return res.status(error.status).json({
                mensaje: error.message
            });
        }

        console.error('Error de login:', error.message);

        return res.status(500).json({
            mensaje: 'Error interno del servidor.'
        });
    }
}

/* CONSULTA DE SESION ACTUAL */

function me(req, res) {
    return res.json({
        autenticado: true,
        usuario: req.usuario
    });
}

/* CIERRE DE SESION */

function logout(req, res) {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'No se pudo cerrar la sesión.'
            });
        }

        res.clearCookie('alto.sid', {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: APP_CONFIG.entorno === 'production'
        });

        return res.json({
            mensaje: 'Sesión cerrada correctamente.'
        });
    });
}

module.exports = {
    login,
    me,
    logout
};