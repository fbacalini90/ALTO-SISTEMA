const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

const { pool } = require('../src/config/database');
const authService = require('../src/services/auth.service');
const usuarioRepository = require(
    '../src/repositories/usuario.repository'
);

const USUARIO_PRUEBA = 'administrador_test';
const PASSWORD_PRUEBA = 'ClaveFicticia123!';

/* VALIDACION DE CREDENCIALES */

test('Acepta credenciales con formato válido', () => {
    assert.doesNotThrow(() => {
        authService.validarCredenciales(
            USUARIO_PRUEBA,
            PASSWORD_PRUEBA
        );
    });
});

test('Rechaza un usuario vacío', () => {
    assert.throws(
        () => authService.validarCredenciales(
            '',
            PASSWORD_PRUEBA
        ),
        { name: 'AuthError', status: 400 }
    );
});

test('Rechaza un usuario compuesto por espacios', () => {
    assert.throws(
        () => authService.validarCredenciales(
            '   ',
            PASSWORD_PRUEBA
        ),
        { name: 'AuthError', status: 400 }
    );
});

test('Rechaza una contraseña vacía', () => {
    assert.throws(
        () => authService.validarCredenciales(
            USUARIO_PRUEBA,
            ''
        ),
        { name: 'AuthError', status: 400 }
    );
});

test('Rechaza credenciales que no sean cadenas', () => {
    assert.throws(
        () => authService.validarCredenciales(
            12345,
            PASSWORD_PRUEBA
        ),
        { name: 'AuthError', status: 400 }
    );
});

test('Rechaza usuarios de más de 50 caracteres', () => {
    assert.throws(
        () => authService.validarCredenciales(
            'a'.repeat(51),
            PASSWORD_PRUEBA
        ),
        { name: 'AuthError', status: 400 }
    );
});

test('Rechaza contraseñas de más de 72 bytes', () => {
    assert.throws(
        () => authService.validarCredenciales(
            USUARIO_PRUEBA,
            'á'.repeat(37)
        ),
        { name: 'AuthError', status: 400 }
    );
});

/* AUTENTICACION */

test('Rechaza un usuario inexistente', async (t) => {
    t.mock.method(
        usuarioRepository,
        'buscarPorUsuario',
        async () => null
    );

    await assert.rejects(
        authService.autenticar(
            USUARIO_PRUEBA,
            PASSWORD_PRUEBA
        ),
        { name: 'AuthError', status: 401 }
    );
});

test('Rechaza un usuario deshabilitado', async (t) => {
    t.mock.method(
        usuarioRepository,
        'buscarPorUsuario',
        async () => ({
            id: 999,
            usuario: USUARIO_PRUEBA,
            activo: false
        })
    );

    await assert.rejects(
        authService.autenticar(
            USUARIO_PRUEBA,
            PASSWORD_PRUEBA
        ),
        { name: 'AuthError', status: 401 }
    );
});

test('Rechaza una contraseña incorrecta', async (t) => {
    const passwordHash = await bcrypt.hash(
        PASSWORD_PRUEBA,
        4
    );

    t.mock.method(
        usuarioRepository,
        'buscarPorUsuario',
        async () => ({
            id: 999,
            usuario: USUARIO_PRUEBA,
            password_hash: passwordHash,
            activo: true
        })
    );

    await assert.rejects(
        authService.autenticar(
            USUARIO_PRUEBA,
            'PasswordIncorrecta'
        ),
        { name: 'AuthError', status: 401 }
    );
});

test('Autentica correctamente un usuario habilitado', async (t) => {
    const passwordHash = await bcrypt.hash(
        PASSWORD_PRUEBA,
        4
    );

    const consulta = t.mock.method(
        usuarioRepository,
        'buscarPorUsuario',
        async () => ({
            id: 999,
            usuario: USUARIO_PRUEBA,
            password_hash: passwordHash,
            activo: true
        })
    );

    const resultado = await authService.autenticar(
        `  ${USUARIO_PRUEBA}  `,
        PASSWORD_PRUEBA
    );

    assert.deepEqual(resultado, {
        id: 999,
        usuario: USUARIO_PRUEBA
    });

    assert.equal(
        consulta.mock.callCount(),
        1
    );

    assert.deepEqual(
        consulta.mock.calls[0].arguments,
        [USUARIO_PRUEBA]
    );

    assert.equal(
        Object.hasOwn(resultado, 'password_hash'),
        false
    );
});

/* VERIFICACION DE USUARIOS ACTIVOS */

test('Obtiene correctamente un usuario activo', async (t) => {
    const usuario = {
        id: 999,
        usuario: USUARIO_PRUEBA
    };

    t.mock.method(
        usuarioRepository,
        'buscarActivoPorId',
        async () => usuario
    );

    const resultado =
        await authService.obtenerUsuarioActivo(999);

    assert.deepEqual(resultado, usuario);
});

test('No devuelve usuarios inexistentes o inactivos', async (t) => {
    t.mock.method(
        usuarioRepository,
        'buscarActivoPorId',
        async () => null
    );

    const resultado =
        await authService.obtenerUsuarioActivo(999);

    assert.equal(resultado, null);
});

/* LIBERACION DE RECURSOS */

after(async () => {
    await pool.end();
});