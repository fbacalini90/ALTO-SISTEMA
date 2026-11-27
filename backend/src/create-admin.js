const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');

async function createAdmin() {
    try {
        const usuario = process.env.ADMIN_USER?.trim();
        const password = process.env.ADMIN_PASSWORD;

        if (!usuario || usuario.length > 50) {
            throw new Error('Nombre de usuario invalido.');
        }

        if (!password || password.length < 12 ||
            Buffer.byteLength(password, 'utf8') > 72) {
            throw new Error(
                'La contraseña debe tener al menos 12 caracteres y no superar los 72 bytes.'
            );
        }

        const [usuarios] = await pool.query(
            'SELECT id FROM usuarios LIMIT 1'
        );

        if (usuarios.length > 0) {
            console.log('Ya existe un usuario administrador.');
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await pool.execute(
            `INSERT INTO usuarios
            (usuario, password_hash, activo)
            VALUES (?, ?, TRUE)`,
            [usuario, passwordHash]
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