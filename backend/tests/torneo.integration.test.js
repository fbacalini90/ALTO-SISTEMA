const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

/* CONFIGURACION DEL ENTORNO AISLADO */

const BASE_PRUEBAS = 'altosistemahu004test';

const API_URL = 'http://127.0.0.1:3001/api';

const ORIGEN = 'http://localhost:5173';

const HABILITADA =
    process.env.ALTO_TORNEO_INTEGRATION_TEST === '1';

/* SOLICITUDES HTTP */

async function solicitud(
    ruta,
    {
        metodo = 'GET',
        datos,
        cookie,
        origen = ORIGEN
    } = {}
) {
    const headers = {
        Origin: origen
    };

    if (datos !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    if (cookie) {
        headers.Cookie = cookie;
    }

    const respuesta = await fetch(
        `${API_URL}${ruta}`,
        {
            method: metodo,
            headers,
            body: datos !== undefined
                ? JSON.stringify(datos)
                : undefined,
            signal: AbortSignal.timeout(5000)
        }
    );

    const cuerpo = await respuesta.json();

    return {
        status: respuesta.status,
        headers: respuesta.headers,
        cuerpo
    };
}

/* PRUEBA INTEGRAL */

test(
    'Integración completa de gestión de torneos',
    {
        skip: !HABILITADA,
        timeout: 60000
    },
    async (t) => {
        /* PROTECCIONES DEL ENTORNO */

        assert.equal(
            process.env.DB_NAME,
            BASE_PRUEBAS,
            'La prueba requiere una base de datos aislada.'
        );

        assert.equal(
            process.env.ALTO_TEST_USER,
            'admin_pruebas',
            'Debe utilizarse el administrador ficticio.'
        );

        assert.ok(
            process.env.ALTO_TEST_PASSWORD,
            'Falta la contraseña del administrador de pruebas.'
        );

        const { pool } =
            require('../src/config/database');

        const prefijo = `HU004-${randomUUID()}`;

        const nombreA = `${prefijo} A`;
        const nombreB = `${prefijo} B`;
        const nombreEditado = `${prefijo} MODIFICADO`;

        let cookie = null;
        let idA = null;
        let idB = null;

        let baseVerificada = false;

        try {
            /* VERIFICAR BASE DE DATOS */

            const [bases] = await pool.query(
                'SELECT DATABASE() AS nombre'
            );

            assert.equal(
                bases[0].nombre,
                BASE_PRUEBAS
            );

            baseVerificada = true;

            /* 01 — DISPONIBILIDAD DEL SERVIDOR */

            const health = await solicitud('/health');

            assert.equal(health.status, 200);

            assert.equal(
                health.cuerpo.backend,
                'ONLINE'
            );

            assert.equal(
                health.cuerpo.database,
                'ONLINE'
            );

            t.diagnostic(
                '01 — Servidor de pruebas operativo.'
            );

            /* 02 — PROTECCION SIN AUTENTICACION */

            const operacionesPrivadas = [
                {
                    ruta: '/torneos',
                    metodo: 'GET'
                },
                {
                    ruta: '/torneos/1',
                    metodo: 'GET'
                },
                {
                    ruta: '/torneos',
                    metodo: 'POST',
                    datos: {
                        nombre: nombreA
                    }
                },
                {
                    ruta: '/torneos/1',
                    metodo: 'PUT',
                    datos: {
                        nombre: nombreA
                    }
                },
                {
                    ruta: '/torneos/1/estado',
                    metodo: 'PATCH',
                    datos: {
                        estado: 'ARCHIVADO'
                    }
                },
                {
                    ruta: '/torneos/2147483647',
                    metodo: 'DELETE'
                }
            ];

            for (const operacion of operacionesPrivadas) {
                const respuesta = await solicitud(
                    operacion.ruta,
                    {
                        metodo: operacion.metodo,
                        datos: operacion.datos
                    }
                );

                assert.equal(
                    respuesta.status,
                    401
                );
            }

            t.diagnostic(
                '02 — Todos los endpoints requieren autenticación.'
            );

            /* 03 — AUTENTICACION */

            const login = await solicitud(
                '/auth/login',
                {
                    metodo: 'POST',
                    datos: {
                        usuario:
                            process.env.ALTO_TEST_USER,

                        password:
                            process.env.ALTO_TEST_PASSWORD
                    }
                }
            );

            assert.equal(login.status, 200);

            const setCookie =
                login.headers.get('set-cookie');

            assert.ok(setCookie);

            assert.match(
                setCookie,
                /HttpOnly/i
            );

            assert.match(
                setCookie,
                /SameSite=Lax/i
            );

            cookie = setCookie.split(';')[0];

            /* VERIFICAR AISLAMIENTO DE LA SESION */

            assert.ok(
                cookie.startsWith('alto.sid=')
            );

            const cookieDecodificada =
                decodeURIComponent(
                    cookie.slice('alto.sid='.length)
                );

            const coincidencia =
                cookieDecodificada.match(
                    /^s:([^.]+)\./
                );

            assert.ok(
                coincidencia,
                'No se pudo identificar la sesión firmada.'
            );

            const sessionId = coincidencia[1];

            const [sesiones] = await pool.execute(
                `
                    SELECT session_id
                    FROM sessions
                    WHERE session_id = ?
                `,
                [sessionId]
            );

            assert.equal(
                sesiones.length,
                1,
                'La sesión no pertenece a la base de pruebas.'
            );

            t.diagnostic(
                '03 — Autenticación y aislamiento de sesión verificados.'
            );

            /* 04 — CONTROL DE ORIGEN */

            const origenIncorrecto =
                await solicitud('/torneos', {
                    metodo: 'POST',
                    datos: {
                        nombre: nombreA
                    },
                    cookie,
                    origen: 'https://example.invalid'
                });

            assert.equal(
                origenIncorrecto.status,
                403
            );

            t.diagnostic(
                '04 — Solicitudes de origen no autorizado rechazadas.'
            );

            /* 05 — VALIDACION DE DATOS */

            const datosInvalidos = [
                {},
                { nombre: '' },
                { nombre: '   ' },
                { nombre: 100 },
                { nombre: 'A'.repeat(101) },
                {
                    nombre: nombreA,
                    descripcion: 'A'.repeat(501)
                },
                {
                    nombre: nombreA,
                    estado: 'ARCHIVADO'
                }
            ];

            for (const datos of datosInvalidos) {
                const respuesta =
                    await solicitud('/torneos', {
                        metodo: 'POST',
                        datos,
                        cookie
                    });

                assert.equal(
                    respuesta.status,
                    400
                );
            }

            t.diagnostic(
                '05 — Validación de campos y longitudes correcta.'
            );

            /* 06 — CREACION DEL PRIMER TORNEO */

            const creacionA =
                await solicitud('/torneos', {
                    metodo: 'POST',
                    datos: {
                        nombre: `  ${prefijo}   A  `,
                        descripcion: 'Competición ficticia A'
                    },
                    cookie
                });

            assert.equal(creacionA.status, 201);

            idA = creacionA.cuerpo.torneo.id;

            assert.ok(
                Number.isInteger(idA)
            );

            assert.equal(
                creacionA.cuerpo.torneo.nombre,
                nombreA
            );

            assert.equal(
                creacionA.cuerpo.torneo.estado,
                'ACTIVO'
            );

            assert.equal(
                creacionA.headers.get('location'),
                `/api/torneos/${idA}`
            );

            t.diagnostic(
                '06 — Creación y normalización del primer torneo.'
            );

            /* 07 — PREVENCION DE DUPLICADOS */

            const duplicados = [
                nombreA,
                nombreA.toLowerCase(),
                `  ${prefijo}    A  `
            ];

            for (const nombre of duplicados) {
                const respuesta =
                    await solicitud('/torneos', {
                        metodo: 'POST',
                        datos: { nombre },
                        cookie
                    });

                assert.equal(
                    respuesta.status,
                    409
                );
            }

            t.diagnostic(
                '07 — Restricción de nombres duplicados verificada en MySQL.'
            );

            /* 08 — CREACION DEL SEGUNDO TORNEO */

            const creacionB =
                await solicitud('/torneos', {
                    metodo: 'POST',
                    datos: {
                        nombre: nombreB
                    },
                    cookie
                });

            assert.equal(creacionB.status, 201);

            idB = creacionB.cuerpo.torneo.id;

            assert.ok(
                Number.isInteger(idB)
            );

            assert.notEqual(idA, idB);

            assert.equal(
                creacionB.cuerpo.torneo.descripcion,
                null
            );

            t.diagnostic(
                '08 — Segundo torneo independiente creado.'
            );

            /* 09 — LISTADO Y BUSQUEDA */

            const listado = await solicitud(
                '/torneos',
                { cookie }
            );

            assert.equal(listado.status, 200);

            assert.equal(
                listado.cuerpo.total,
                listado.cuerpo.torneos.length
            );

            const ids = listado.cuerpo.torneos.map(
                (torneo) => torneo.id
            );

            assert.ok(ids.includes(idA));
            assert.ok(ids.includes(idB));

            const filtrosBusqueda =
                new URLSearchParams({
                    busqueda: prefijo,
                    estado: 'ACTIVO'
                });

            const busqueda = await solicitud(
                `/torneos?${filtrosBusqueda}`,
                { cookie }
            );

            assert.equal(busqueda.status, 200);

            assert.equal(
                busqueda.cuerpo.total,
                2
            );

            t.diagnostic(
                '09 — Listado, búsqueda y filtros correctos.'
            );

            /* 10 — CONSULTA INDIVIDUAL */

            const consulta = await solicitud(
                `/torneos/${idA}`,
                { cookie }
            );

            assert.equal(consulta.status, 200);

            assert.equal(
                consulta.cuerpo.torneo.nombre,
                nombreA
            );

            const idInvalido = await solicitud(
                '/torneos/0',
                { cookie }
            );

            assert.equal(
                idInvalido.status,
                400
            );

            const inexistente = await solicitud(
                '/torneos/2147483647',
                { cookie }
            );

            assert.equal(
                inexistente.status,
                404
            );

            t.diagnostic(
                '10 — Consulta individual y control de identificadores.'
            );

            /* 11 — EDICION DEL TORNEO */

            const edicion = await solicitud(
                `/torneos/${idA}`,
                {
                    metodo: 'PUT',
                    datos: {
                        nombre: nombreEditado,
                        descripcion: 'Descripción modificada'
                    },
                    cookie
                }
            );

            assert.equal(edicion.status, 200);

            assert.equal(
                edicion.cuerpo.torneo.nombre,
                nombreEditado
            );

            assert.equal(
                edicion.cuerpo.torneo.descripcion,
                'Descripción modificada'
            );

            assert.equal(
                edicion.cuerpo.torneo.estado,
                'ACTIVO'
            );

            /* EDICION DUPLICADA */

            const edicionDuplicada =
                await solicitud(`/torneos/${idA}`, {
                    metodo: 'PUT',
                    datos: {
                        nombre: nombreB
                    },
                    cookie
                });

            assert.equal(
                edicionDuplicada.status,
                409
            );

            t.diagnostic(
                '11 — Edición correcta y prevención de duplicados.'
            );

            /* 12 — ARCHIVADO */

            const archivado = await solicitud(
                `/torneos/${idA}/estado`,
                {
                    metodo: 'PATCH',
                    datos: {
                        estado: 'ARCHIVADO'
                    },
                    cookie
                }
            );

            assert.equal(archivado.status, 200);

            assert.equal(
                archivado.cuerpo.torneo.estado,
                'ARCHIVADO'
            );

            assert.equal(
                archivado.cuerpo.torneo.id,
                idA
            );

            assert.equal(
                archivado.cuerpo.torneo.nombre,
                nombreEditado
            );

            assert.equal(
                archivado.cuerpo.torneo.descripcion,
                'Descripción modificada'
            );

            /* NOMBRE ARCHIVADO RESERVADO */

            const duplicadoArchivado =
                await solicitud('/torneos', {
                    metodo: 'POST',
                    datos: {
                        nombre: nombreEditado
                    },
                    cookie
                });

            assert.equal(
                duplicadoArchivado.status,
                409
            );

            t.diagnostic(
                '12 — Archivado sin pérdida de información.'
            );

            /* 13 — FILTROS E INDEPENDENCIA */

            const filtrosArchivados =
                new URLSearchParams({
                    busqueda: prefijo,
                    estado: 'ARCHIVADO'
                });

            const archivados = await solicitud(
                `/torneos?${filtrosArchivados}`,
                { cookie }
            );

            assert.equal(archivados.status, 200);

            assert.equal(
                archivados.cuerpo.total,
                1
            );

            assert.equal(
                archivados.cuerpo.torneos[0].id,
                idA
            );

            const activos = await solicitud(
                `/torneos?${filtrosBusqueda}`,
                { cookie }
            );

            assert.equal(activos.status, 200);

            assert.equal(
                activos.cuerpo.total,
                1
            );

            assert.equal(
                activos.cuerpo.torneos[0].id,
                idB
            );

            const segundoTorneo = await solicitud(
                `/torneos/${idB}`,
                { cookie }
            );

            assert.equal(
                segundoTorneo.cuerpo.torneo.nombre,
                nombreB
            );

            assert.equal(
                segundoTorneo.cuerpo.torneo.estado,
                'ACTIVO'
            );

            t.diagnostic(
                '13 — Independencia entre torneos y filtros por estado.'
            );

            /* 14 — REACTIVACION */

            const reactivado = await solicitud(
                `/torneos/${idA}/estado`,
                {
                    metodo: 'PATCH',
                    datos: {
                        estado: 'ACTIVO'
                    },
                    cookie
                }
            );

            assert.equal(reactivado.status, 200);

            assert.equal(
                reactivado.cuerpo.torneo.estado,
                'ACTIVO'
            );

            assert.equal(
                reactivado.cuerpo.torneo.id,
                idA
            );

            t.diagnostic(
                '14 — Reactivación correcta.'
            );

            /* 15 — ESTADO INVALIDO */

            const estadoInvalido = await solicitud(
                `/torneos/${idA}/estado`,
                {
                    metodo: 'PATCH',
                    datos: {
                        estado: 'ELIMINADO'
                    },
                    cookie
                }
            );

            assert.equal(
                estadoInvalido.status,
                400
            );

            t.diagnostic(
                '15 — Estados administrativos inválidos rechazados.'
            );

            /* 16 — PROTECCION DE LA ELIMINACION */

            const sinSesion = await solicitud(`/torneos/${idA}`, {
                metodo: 'DELETE'
            });
            assert.equal(sinSesion.status, 401);

            const origenDeleteIncorrecto = await solicitud(`/torneos/${idA}`, {
                metodo: 'DELETE',
                cookie,
                origen: 'https://example.invalid'
            });
            assert.equal(origenDeleteIncorrecto.status, 403);

            const idDeleteInvalido = await solicitud('/torneos/0', {
                metodo: 'DELETE', cookie
            });
            assert.equal(idDeleteInvalido.status, 400);

            const deleteInexistente = await solicitud('/torneos/2147483647', {
                metodo: 'DELETE', cookie
            });
            assert.equal(deleteInexistente.status, 404);

            const conservado = await solicitud(`/torneos/${idA}`, { cookie });
            assert.equal(conservado.status, 200);

            t.diagnostic(
                '16 — Autenticación, origen e identificadores de eliminación verificados.'
            );

            /* 17 — PERSISTENCIA REAL EN MYSQL */

            const [registros] = await pool.execute(
                `
                    SELECT
                        id,
                        nombre,
                        descripcion,
                        estado,
                        fecha_creacion,
                        fecha_actualizacion
                    FROM torneos
                    WHERE id IN (?, ?)
                `,
                [idA, idB]
            );

            assert.equal(registros.length, 2);

            const registroA = registros.find(
                (registro) => registro.id === idA
            );

            const registroB = registros.find(
                (registro) => registro.id === idB
            );

            assert.ok(registroA);
            assert.ok(registroB);

            assert.equal(
                registroA.nombre,
                nombreEditado
            );

            assert.equal(
                registroA.descripcion,
                'Descripción modificada'
            );

            assert.equal(
                registroA.estado,
                'ACTIVO'
            );

            assert.equal(
                registroB.nombre,
                nombreB
            );

            assert.equal(
                registroB.descripcion,
                null
            );

            assert.equal(
                registroB.estado,
                'ACTIVO'
            );

            assert.ok(registroA.fecha_creacion);
            assert.ok(registroA.fecha_actualizacion);

            t.diagnostic(
                '17 — Persistencia efectiva y consistencia de datos en MySQL.'
            );

            /* 18 — ELIMINACION DEFINITIVA DE TORNEO ACTIVO */

            const eliminacion = await solicitud(`/torneos/${idA}`, {
                metodo: 'DELETE', cookie
            });
            assert.equal(eliminacion.status, 200);
            assert.equal(eliminacion.cuerpo.mensaje, 'Torneo eliminado correctamente.');

            const consultaEliminado = await solicitud(`/torneos/${idA}`, { cookie });
            assert.equal(consultaEliminado.status, 404);

            const repetirEliminacion = await solicitud(`/torneos/${idA}`, {
                metodo: 'DELETE', cookie
            });
            assert.equal(repetirEliminacion.status, 404);

            const [eliminadosA] = await pool.execute(
                'SELECT id FROM torneos WHERE id = ?', [idA]
            );
            assert.equal(eliminadosA.length, 0);

            const listadoTrasEliminar = await solicitud(`/torneos?${filtrosBusqueda}`, { cookie });
            assert.equal(listadoTrasEliminar.status, 200);
            assert.equal(listadoTrasEliminar.cuerpo.total, 1);
            assert.equal(listadoTrasEliminar.cuerpo.torneos[0].id, idB);

            const [restantesB] = await pool.execute(
                'SELECT * FROM torneos WHERE id = ?', [idB]
            );
            assert.equal(restantesB.length, 1);
            assert.deepEqual(restantesB[0], registroB);

            t.diagnostic(
                '18 — Eliminación de torneo activo, ausencia física e independencia verificadas.'
            );

            /* 19 — REUTILIZACION DEL NOMBRE Y ELIMINACION DE ARCHIVADO */

            const recreacion = await solicitud('/torneos', {
                metodo: 'POST',
                datos: { nombre: nombreEditado },
                cookie
            });
            assert.equal(recreacion.status, 201);
            assert.equal(recreacion.cuerpo.torneo.nombre, nombreEditado);
            assert.equal(recreacion.cuerpo.torneo.estado, 'ACTIVO');

            const idC = recreacion.cuerpo.torneo.id;
            assert.ok(Number.isInteger(idC));
            assert.notEqual(idC, idA);
            assert.notEqual(idC, idB);

            const archivoC = await solicitud(`/torneos/${idC}/estado`, {
                metodo: 'PATCH', datos: { estado: 'ARCHIVADO' }, cookie
            });
            assert.equal(archivoC.status, 200);
            assert.equal(archivoC.cuerpo.torneo.estado, 'ARCHIVADO');

            const eliminarC = await solicitud(`/torneos/${idC}`, {
                metodo: 'DELETE', cookie
            });
            assert.equal(eliminarC.status, 200);

            const consultaC = await solicitud(`/torneos/${idC}`, { cookie });
            assert.equal(consultaC.status, 404);

            const [registrosC] = await pool.execute(
                'SELECT id FROM torneos WHERE id = ?', [idC]
            );
            assert.equal(registrosC.length, 0);

            const [verificacionB] = await pool.execute(
                'SELECT * FROM torneos WHERE id = ?', [idB]
            );
            assert.equal(verificacionB.length, 1);
            assert.deepEqual(verificacionB[0], registroB);

            const listadoFinal = await solicitud(`/torneos?${new URLSearchParams({ busqueda: prefijo })}`, { cookie });
            assert.equal(listadoFinal.status, 200);
            assert.equal(listadoFinal.cuerpo.total, 1);
            assert.equal(listadoFinal.cuerpo.torneos[0].id, idB);

            t.diagnostic(
                '19 — Reutilización del nombre y eliminación de torneo archivado verificadas.'
            );

            /* 20 — CIERRE DE SESION */

            const logout = await solicitud(
                '/auth/logout',
                {
                    metodo: 'POST',
                    cookie
                }
            );

            assert.equal(logout.status, 200);

            const accesoPosterior = await solicitud(
                '/torneos',
                { cookie }
            );

            assert.equal(
                accesoPosterior.status,
                401
            );

            cookie = null;

            t.diagnostic(
                '20 — Cierre de sesión e invalidación de acceso verificados.'
            );

        } finally {
            try {
                /* CERRAR SESION ANTE ERRORES */

                if (cookie) {
                    try {
                        await solicitud(
                            '/auth/logout',
                            {
                                metodo: 'POST',
                                cookie
                            }
                        );
                    } catch {
                        t.diagnostic(
                            'Advertencia: no se pudo cerrar la sesión de prueba.'
                        );
                    }
                }

                /* LIMPIEZA EXCLUSIVA DE DATOS FICTICIOS */

                if (baseVerificada) {
                    const [bases] = await pool.query(
                        'SELECT DATABASE() AS nombre'
                    );

                    assert.equal(
                        bases[0].nombre,
                        BASE_PRUEBAS
                    );

                    await pool.execute(
                        `
                            DELETE FROM torneos
                            WHERE nombre IN (?, ?, ?)
                        `,
                        [
                            nombreA,
                            nombreB,
                            nombreEditado
                        ]
                    );

                    t.diagnostic(
                        'Registros ficticios eliminados de la base de pruebas.'
                    );
                }

            } finally {
                await pool.end();
            }
        }
    }
);