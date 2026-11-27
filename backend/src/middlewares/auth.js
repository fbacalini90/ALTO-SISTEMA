const { pool } = require('../config/database');

async function requireAuth(req, res, next) {
    if (!req.session?.usuarioId) {
        return res.status(401).json({
            mensaje: 'Debes iniciar sesion.'
        });
    }

    try {
        const [usuarios] = await pool.execute(
            'SELECT id, usuario, activo FROM usuarios WHERE id = ?',
            [req.session.usuarioId]
        );

        if (usuarios.length === 0 || !usuarios[0].activo) {
            return res.status(401).json({
                mensaje: 'Usuario no habilitado.'
            });
        }

        req.usuario = {
            id: usuarios[0].id,
            usuario: usuarios[0].usuario
        };

        next();

    } catch (error) {
        console.error('Error de autenticacion:', error.message);

        return res.status(500).json({
            mensaje: 'Error interno del servidor.'
        });
    }
}

module.exports = {
    requireAuth
};