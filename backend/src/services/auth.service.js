const bcrypt = require('bcryptjs');
const usuarioRepository = require('../repositories/usuario.repository');

class AuthError extends Error {
    constructor(mensaje, status) {
        super(mensaje);

        this.name = 'AuthError';
        this.status = status;
    }
}

function validarCredenciales(usuario, password) {
    if (
        typeof usuario !== 'string' ||
        typeof password !== 'string' ||
        !usuario.trim() ||
        !password ||
        usuario.length > 50 ||
        Buffer.byteLength(password, 'utf8') > 72
    ) {
        throw new AuthError(
            'Credenciales inválidas.',
            400
        );
    }
}

async function autenticar(usuario, password) {
    validarCredenciales(usuario, password);

    const administrador =
        await usuarioRepository.buscarPorUsuario(
            usuario.trim()
        );

    if (!administrador || !administrador.activo) {
        throw new AuthError(
            'Usuario o contraseña incorrectos.',
            401
        );
    }

    const passwordCorrecta = await bcrypt.compare(
        password,
        administrador.password_hash
    );

    if (!passwordCorrecta) {
        throw new AuthError(
            'Usuario o contraseña incorrectos.',
            401
        );
    }

    return {
        id: administrador.id,
        usuario: administrador.usuario
    };
}

async function obtenerUsuarioActivo(id) {
    return usuarioRepository.buscarActivoPorId(id);
}

module.exports = {
    AuthError,
    validarCredenciales,
    autenticar,
    obtenerUsuarioActivo
};