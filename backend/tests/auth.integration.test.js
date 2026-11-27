const { test } = require('node:test');
const assert = require('node:assert/strict');

const { APP_CONFIG } = require('../src/config/app.config');

const HABILITADA =
    process.env.ALTO_INTEGRATION_TEST === '1';

const API_URL =
    `http://127.0.0.1:${APP_CONFIG.servidor.puerto}/api`;

const ORIGEN =
    APP_CONFIG.servidor.frontendUrl;

async function solicitar(
    ruta,
    {
        method = 'GET',
        body,
        cookie,
        origen = ORIGEN
    } = {}
) {
    const headers = {
        Accept: 'application/json',
        Origin: origen
    };

    if (cookie) {
        headers.Cookie = cookie;
    }

    const opciones = {
        method,
        headers,
        redirect: 'error',
        signal: AbortSignal.timeout(10000)
    };

    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        opciones.body = JSON.stringify(body);
    }

    return fetch(
        `${API_URL}${ruta}`,
        opciones
    );
}

test(
    'Integración completa de autenticación y sesiones',
    { skip: !HABILITADA },
    async () => {
        const usuario =
            process.env.ALTO_TEST_USER;

        const password =
            process.env.ALTO_TEST_PASSWORD;

        assert.ok(
            usuario && password,
            'Faltan las credenciales de integración.'
        );

        let cookie = null;

        try {
            /* 1. INFRAESTRUCTURA */

            const health = await solicitar('/health');

            assert.equal(health.status, 200);

            const estado = await health.json();

            assert.equal(
                estado.backend,
                'ONLINE'
            );

            assert.equal(
                estado.database,
                'ONLINE'
            );

            assert.equal(
                estado.version,
                APP_CONFIG.version
            );

            /* 2. ACCESO SIN AUTENTICACION */

            const accesoPublico =
                await solicitar('/privado');

            assert.equal(
                accesoPublico.status,
                401
            );

            /* 3. INICIO DE SESION */

            const login = await solicitar(
                '/auth/login',
                {
                    method: 'POST',
                    body: {
                        usuario,
                        password
                    }
                }
            );

            assert.equal(login.status, 200);

            const datosLogin = await login.json();

            assert.ok(datosLogin.usuario?.id);

            assert.equal(
                datosLogin.usuario.usuario,
                usuario
            );

            assert.equal(
                Object.hasOwn(
                    datosLogin.usuario,
                    'password_hash'
                ),
                false
            );

            /* 4. COOKIE DE SESION */

            const cookies =
                login.headers.getSetCookie();

            const cookieSesion = cookies.find(
                (valor) => valor.startsWith('alto.sid=')
            );

            assert.ok(
                cookieSesion,
                'No se recibió la cookie de sesión.'
            );

            cookie = cookieSesion.split(';')[0];

            assert.ok(
                /;\s*HttpOnly(?:;|$)/i.test(cookieSesion),
                'La cookie debe ser HttpOnly.'
            );

            assert.ok(
                /;\s*SameSite=Lax(?:;|$)/i.test(cookieSesion),
                'La cookie debe utilizar SameSite=Lax.'
            );

            /* 5. VERIFICACION DE SESION */

            const me = await solicitar(
                '/auth/me',
                { cookie }
            );

            assert.equal(me.status, 200);

            const datosSesion = await me.json();

            assert.equal(
                datosSesion.autenticado,
                true
            );

            assert.deepEqual(
                datosSesion.usuario,
                datosLogin.usuario
            );

            /* 6. ACCESO PRIVADO AUTORIZADO */

            const accesoPrivado =
                await solicitar(
                    '/privado',
                    { cookie }
                );

            assert.equal(
                accesoPrivado.status,
                200
            );

            /* 7. PROTECCION DE ORIGEN */

            const origenInvalido =
                await solicitar(
                    '/auth/logout',
                    {
                        method: 'POST',
                        cookie,
                        origen: 'https://origen-invalido.example'
                    }
                );

            assert.equal(
                origenInvalido.status,
                403
            );

            /* 8. CIERRE DE SESION */

            const logout = await solicitar(
                '/auth/logout',
                {
                    method: 'POST',
                    cookie
                }
            );

            assert.equal(
                logout.status,
                200
            );

            /* 9. INVALIDACION DE SESION */

            const accesoPosterior =
                await solicitar(
                    '/privado',
                    { cookie }
                );

            assert.equal(
                accesoPosterior.status,
                401
            );

            cookie = null;

        } finally {
            // Intentar cerrar la sesion de prueba
            // si la ejecucion se interrumpe.

            if (cookie) {
                await solicitar(
                    '/auth/logout',
                    {
                        method: 'POST',
                        cookie
                    }
                ).catch(() => {});
            }
        }
    }
);