const authService = require('../services/auth.service');

async function requireAuth(req, res, next) {
    if (!req.session?.usuarioId) {
        return res.status(401).json({
            mensaje: 'Debes iniciar sesión.'
        });
    }

    try {
        const usuario = await authService.obtenerUsuarioActivo(
            req.session.usuarioId
        );

        if (!usuario) {
            return res.status(401).json({
                mensaje: 'Usuario no habilitado.'
            });
        }

        req.usuario = {
            id: usuario.id,
            usuario: usuario.usuario
        };

        next();

    } catch (error) {
        console.error('Error de autenticación:', error.message);

        return res.status(500).json({
            mensaje: 'Error interno del servidor.'
        });
    }
}

module.exports = {
    requireAuth
};