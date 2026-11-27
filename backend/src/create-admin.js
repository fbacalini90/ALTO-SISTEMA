const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');
const usuarioRepository = require('./repositories/usuario.repository');

async function createAdmin() {
    try {
        const usuario = process.env.ADMIN_USER?.trim();
        const password = process.env.ADMIN_PASSWORD;

        if (!usuario || usuario.length > 50) {
            throw new Error('Nombre de usuario inválido.');
        }

        if (
            !password ||
            password.length < 12 ||
            Buffer.byteLength(password, 'utf8') > 72
        ) {
            throw new Error(
                'La contraseña debe tener al menos 12 caracteres y no superar los 72 bytes.'
            );
        }

        const cantidadUsuarios =
            await usuarioRepository.contarUsuarios();

        if (cantidadUsuarios > 0) {
            console.log('Ya existe un usuario administrador.');
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await usuarioRepository.crearUsuario(
            usuario,
            passwordHash
        );

        console.log('================================');
        console.log('ADMINISTRADOR CREADO CORRECTAMENTE');
        console.log('Usuario: ' + usuario);
        console.log('================================');

    } catch (error) {
        console.error('Error: ' + error.message);
        process.exitCode = 1;

    } finally {
        await pool.end();
    }
}

createAdmin();