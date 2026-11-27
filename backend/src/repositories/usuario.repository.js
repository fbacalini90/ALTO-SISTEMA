const { pool } = require('../config/database');

async function buscarPorUsuario(usuario) {
    const [usuarios] = await pool.execute(
        `SELECT id, usuario, password_hash, activo
         FROM usuarios
         WHERE usuario = ?
         LIMIT 1`,
        [usuario]
    );

    return usuarios[0] || null;
}

async function buscarActivoPorId(id) {
    const [usuarios] = await pool.execute(
        `SELECT id, usuario
         FROM usuarios
         WHERE id = ?
           AND activo = TRUE
         LIMIT 1`,
        [id]
    );

    return usuarios[0] || null;
}

async function contarUsuarios() {
    const [resultado] = await pool.execute(
        `SELECT COUNT(*) AS cantidad
         FROM usuarios`
    );

    return Number(resultado[0].cantidad);
}

async function crearUsuario(usuario, passwordHash) {
    const [resultado] = await pool.execute(
        `INSERT INTO usuarios (
            usuario,
            password_hash
         ) VALUES (?, ?)`,
        [usuario, passwordHash]
    );

    return resultado.insertId;
}

module.exports = {
    buscarPorUsuario,
    buscarActivoPorId,
    contarUsuarios,
    crearUsuario
};