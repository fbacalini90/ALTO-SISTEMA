'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');


/* ==================================================
   CONFIGURACION DEL ENTORNO AISLADO
   ================================================== */

const BASE_PRUEBAS = 'altosistemahu004test';

const API_URL = 'http://127.0.0.1:3001/api';

const ORIGEN = 'http://localhost:5173';

const HABILITADA =
    process.env.ALTO_CATEGORIA_INTEGRATION_TEST === '1';


/* ==================================================
   SOLICITUDES HTTP
   ================================================== */

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

    return {
        status: respuesta.status,
        headers: respuesta.headers,
        cuerpo: await respuesta.json()
    };
}


function verificarEstado(respuesta, esperado, contexto) {

    assert.equal(
        respuesta.status,
        esperado,
        `${contexto}: ${JSON.stringify(respuesta.cuerpo)}`
    );

    return respuesta.cuerpo;
}


function verificarId(id) {

    assert.ok(
        Number.isSafeInteger(id) && id > 0,
        'Identificador de registro inválido.'
    );

    return id;
}


/* ==================================================
   PRUEBA INTEGRAL
   ================================================== */

test(
    'Integración completa de gestión de categorías',
    {
        skip: !HABILITADA,
        timeout: 120000
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

        const { pool } = require(
            '../src/config/database'
        );

        const prefijo = `HU006-${randomUUID()}`;

        const nombreTorneoA = `${prefijo} TORNEO A`;
        const nombreTorneoB = `${prefijo} TORNEO B`;

        let cookie = null;
        let baseVerificada = false;
        let sesionVerificada = false;

        let torneoA;
        let torneoB;

        let edicionA;
        let edicionB;
        let edicionC;

        let categoriaA;
        let categoriaB;
        let categoriaC;
        let categoriaD;


        /* FUNCIONES AUXILIARES */

        async function operar(
            ruta,
            metodo = 'GET',
            datos,
            esperado = 200,
            origen = ORIGEN
        ) {

            const respuesta = await solicitud(
                ruta,
                {
                    metodo,
                    datos,
                    cookie,
                    origen
                }
            );

            return verificarEstado(
                respuesta,
                esperado,
                `${metodo} ${ruta}`
            );
        }


        async function crearTorneo(nombre) {

            const datos = await operar(
                '/torneos',
                'POST',
                { nombre },
                201
            );

            assert.equal(
                datos.torneo.nombre,
                nombre
            );

            assert.equal(
                datos.torneo.estado,
                'ACTIVO'
            );

            return verificarId(
                datos.torneo.id
            );
        }


        async function crearEdicion(torneoId, nombre) {

            const datos = await operar(
                `/torneos/${torneoId}/ediciones`,
                'POST',
                { nombre },
                201
            );

            assert.equal(
                datos.edicion.estado,
                'PLANIFICADA'
            );

            assert.equal(
                datos.edicion.torneo_id,
                torneoId
            );

            return verificarId(
                datos.edicion.id
            );
        }


        function rutaCategorias(torneoId, edicionId) {

            return `/torneos/${torneoId}/ediciones/${edicionId}/categorias`;
        }


        async function crearCategoria(
            ruta,
            nombre,
            descripcion
        ) {

            const datos = { nombre };

            if (descripcion !== undefined) {
                datos.descripcion = descripcion;
            }

            const respuesta = await solicitud(
                ruta,
                {
                    metodo: 'POST',
                    datos,
                    cookie
                }
            );

            const cuerpo = verificarEstado(
                respuesta,
                201,
                'Creación de categoría'
            );

            const categoria = cuerpo.categoria;

            verificarId(categoria.id);

            assert.equal(
                categoria.estado,
                'ACTIVA'
            );

            assert.equal(
                respuesta.headers.get('location'),
                `/api${ruta}/${categoria.id}`
            );

            return categoria;
        }


        async function comprobarIndicadores(
            ruta,
            total,
            activas,
            archivadas
        ) {

            const resultado = await operar(ruta);

            assert.equal(
                resultado.total,
                total
            );

            assert.equal(
                resultado.categorias.length,
                total
            );

            assert.deepEqual(
                resultado.indicadores,
                {
                    total,
                    activas,
                    archivadas
                }
            );

            return resultado;
        }


        try {

            /* ======================================
               01 - VERIFICACION DE BASE DE DATOS
               ====================================== */

            const [bases] = await pool.query(
                'SELECT DATABASE() AS nombre'
            );

            assert.equal(
                bases[0].nombre,
                BASE_PRUEBAS
            );

            baseVerificada = true;

            t.diagnostic(
                '01 — Base de datos aislada verificada.'
            );


            /* ======================================
               02 - DISPONIBILIDAD DEL SERVIDOR
               ====================================== */

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
                '02 — Servidor de pruebas operativo.'
            );


            /* ======================================
               03 - PROTECCION SIN AUTENTICACION
               ====================================== */

            const rutaPrivada =
                rutaCategorias(1, 1);

            const operacionesPrivadas = [
                {
                    ruta: rutaPrivada,
                    metodo: 'GET'
                },
                {
                    ruta: `${rutaPrivada}/1`,
                    metodo: 'GET'
                },
                {
                    ruta: rutaPrivada,
                    metodo: 'POST',
                    datos: { nombre: prefijo }
                },
                {
                    ruta: `${rutaPrivada}/1`,
                    metodo: 'PUT',
                    datos: { nombre: prefijo }
                },
                {
                    ruta: `${rutaPrivada}/1/estado`,
                    metodo: 'PATCH',
                    datos: { estado: 'ARCHIVADA' }
                },
                {
                    ruta: `${rutaPrivada}/1`,
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

                verificarEstado(
                    respuesta,
                    401,
                    'Acceso sin autenticación'
                );
            }

            t.diagnostic(
                '03 — Los seis endpoints requieren autenticación.'
            );


            /* ======================================
               04 - AUTENTICACION Y AISLAMIENTO
               ====================================== */

            const login = await solicitud(
                '/auth/login',
                {
                    metodo: 'POST',
                    datos: {
                        usuario: process.env.ALTO_TEST_USER,
                        password: process.env.ALTO_TEST_PASSWORD
                    }
                }
            );

            assert.equal(login.status, 200);

            const setCookie =
                login.headers.get('set-cookie');

            assert.ok(setCookie);

            assert.match(setCookie, /HttpOnly/i);

            assert.match(setCookie, /SameSite=Lax/i);

            cookie = setCookie.split(';')[0];

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
                'No se pudo identificar la sesión.'
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

            sesionVerificada = true;

            t.diagnostic(
                '04 — Autenticación y aislamiento de sesión verificados.'
            );


            /* ======================================
               05 - CREACION DEL CONTEXTO DE PRUEBA
               ====================================== */

            torneoA = await crearTorneo(
                nombreTorneoA
            );

            torneoB = await crearTorneo(
                nombreTorneoB
            );

            edicionA = await crearEdicion(
                torneoA,
                `${prefijo} EDICION A`
            );

            edicionB = await crearEdicion(
                torneoA,
                `${prefijo} EDICION B`
            );

            edicionC = await crearEdicion(
                torneoB,
                `${prefijo} EDICION C`
            );

            const rutaA = rutaCategorias(
                torneoA,
                edicionA
            );

            const rutaB = rutaCategorias(
                torneoA,
                edicionB
            );

            const rutaC = rutaCategorias(
                torneoB,
                edicionC
            );

            t.diagnostic(
                '05 — Dos torneos y tres ediciones ficticias creados.'
            );


            /* ======================================
               06 - ESTADO VACIO Y CONTEXTO
               ====================================== */

            const vacio = await comprobarIndicadores(
                rutaA,
                0,
                0,
                0
            );

            assert.equal(
                vacio.torneo.id,
                torneoA
            );

            assert.equal(
                vacio.edicion.id,
                edicionA
            );

            assert.equal(
                vacio.edicion.estado,
                'PLANIFICADA'
            );

            await comprobarIndicadores(
                rutaB,
                0,
                0,
                0
            );

            await comprobarIndicadores(
                rutaC,
                0,
                0,
                0
            );

            t.diagnostic(
                '06 — Ediciones vacías, sin categorías predeterminadas.'
            );


            /* ======================================
               07 - CONTROL DE ORIGEN
               ====================================== */

            await operar(
                rutaA,
                'POST',
                { nombre: 'NO AUTORIZADA' },
                403,
                'https://example.invalid'
            );

            await comprobarIndicadores(
                rutaA,
                0,
                0,
                0
            );

            t.diagnostic(
                '07 — Origen no autorizado rechazado.'
            );


            /* ======================================
               08 - VALIDACIONES DE CREACION
               ====================================== */

            const datosInvalidos = [
                {},
                { nombre: '' },
                { nombre: '   ' },
                { nombre: 123 },
                { nombre: true },
                { nombre: 'A'.repeat(101) },
                {
                    nombre: 'LIBRE',
                    descripcion: 'A'.repeat(501)
                },
                {
                    nombre: 'LIBRE',
                    descripcion: 123
                },
                {
                    nombre: 'LIBRE',
                    estado: 'ARCHIVADA'
                },
                {
                    nombre: 'LIBRE',
                    edicion_id: edicionB
                },
                {
                    nombre: 'LIBRE',
                    campoDesconocido: true
                }
            ];

            for (const datos of datosInvalidos) {

                await operar(
                    rutaA,
                    'POST',
                    datos,
                    400
                );
            }

            await comprobarIndicadores(
                rutaA,
                0,
                0,
                0
            );

            t.diagnostic(
                '08 — Validaciones de creación verificadas.'
            );


            /* ======================================
               09 - CREACION CORRECTA
               ====================================== */

            const nuevaA = await crearCategoria(
                rutaA,
                '   LÍBRE   ',
                '   Categoría principal   '
            );

            categoriaA = nuevaA.id;

            assert.equal(
                nuevaA.nombre,
                'LÍBRE'
            );

            assert.equal(
                nuevaA.descripcion,
                'Categoría principal'
            );

            assert.equal(
                nuevaA.edicion_id,
                edicionA
            );

            assert.ok(nuevaA.fecha_creacion);

            assert.ok(nuevaA.fecha_actualizacion);

            const nuevaB = await crearCategoria(
                rutaA,
                'SENIOR'
            );

            categoriaB = nuevaB.id;

            assert.equal(
                nuevaB.descripcion,
                null
            );

            await comprobarIndicadores(
                rutaA,
                2,
                2,
                0
            );

            t.diagnostic(
                '09 — Creación, normalización, estado inicial e indicadores.'
            );


            /* ======================================
               10 - UNICIDAD POR EDICION
               ====================================== */

            for (const nombre of [
                'LÍBRE',
                'libre',
                'LIBRE',
                'liBre',
                'LI\u0301BRE',
                '   libre   '
            ]) {

                await operar(
                    rutaA,
                    'POST',
                    { nombre },
                    409
                );
            }

            await operar(
                `${rutaA}/${categoriaB}`,
                'PUT',
                { nombre: 'libre' },
                409
            );

            await comprobarIndicadores(
                rutaA,
                2,
                2,
                0
            );

            t.diagnostic(
                '10 — Unicidad insensible a mayúsculas, acentos y normalización.'
            );


            /* ======================================
               11 - INDEPENDENCIA ENTRE CONTEXTOS
               ====================================== */

            categoriaC = (
                await crearCategoria(
                    rutaB,
                    'LIBRE'
                )
            ).id;

            categoriaD = (
                await crearCategoria(
                    rutaC,
                    'LIBRE'
                )
            ).id;

            await comprobarIndicadores(
                rutaA,
                2,
                2,
                0
            );

            await comprobarIndicadores(
                rutaB,
                1,
                1,
                0
            );

            await comprobarIndicadores(
                rutaC,
                1,
                1,
                0
            );

            t.diagnostic(
                '11 — Nombres repetidos permitidos entre ediciones y torneos.'
            );


            /* ======================================
               12 - CONSULTA INDIVIDUAL
               ====================================== */

            const consulta = await operar(
                `${rutaA}/${categoriaA}`
            );

            assert.equal(
                consulta.categoria.id,
                categoriaA
            );

            assert.equal(
                consulta.categoria.nombre,
                'LÍBRE'
            );

            assert.equal(
                consulta.categoria.edicion_id,
                edicionA
            );

            t.diagnostic(
                '12 — Consulta individual correcta.'
            );


            /* ======================================
               13 - VALIDACION DE IDENTIFICADORES
               ====================================== */

            for (const ruta of [
                '/torneos/0/ediciones/1/categorias',
                `/torneos/${torneoA}/ediciones/abc/categorias`,
                `${rutaA}/0`,
                `${rutaA}/abc`,
                `${rutaA}/2147483648`
            ]) {

                await operar(
                    ruta,
                    'GET',
                    undefined,
                    400
                );
            }

            await operar(
                `${rutaA}/2147483647`,
                'GET',
                undefined,
                404
            );

            await operar(
                rutaCategorias(
                    torneoA,
                    edicionC
                ),
                'GET',
                undefined,
                404
            );

            t.diagnostic(
                '13 — Identificadores inválidos y contextos inexistentes rechazados.'
            );


            /* ======================================
               14 - AISLAMIENTO DE OPERACIONES
               ====================================== */

            for (const idAjeno of [
                categoriaC,
                categoriaD
            ]) {

                await operar(
                    `${rutaA}/${idAjeno}`,
                    'GET',
                    undefined,
                    404
                );

                await operar(
                    `${rutaA}/${idAjeno}`,
                    'PUT',
                    { nombre: 'NO MODIFICAR' },
                    404
                );

                await operar(
                    `${rutaA}/${idAjeno}/estado`,
                    'PATCH',
                    { estado: 'ARCHIVADA' },
                    404
                );

                await operar(
                    `${rutaA}/${idAjeno}`,
                    'DELETE',
                    undefined,
                    404
                );
            }

            assert.equal(
                (await operar(
                    `${rutaB}/${categoriaC}`
                )).categoria.nombre,
                'LIBRE'
            );

            assert.equal(
                (await operar(
                    `${rutaC}/${categoriaD}`
                )).categoria.estado,
                'ACTIVA'
            );

            t.diagnostic(
                '14 — Consulta, edición, estado y eliminación aislados por contexto.'
            );


            /* ======================================
               15 - EDICION DE CATEGORIAS
               ====================================== */

            const modificada = await operar(
                `${rutaA}/${categoriaA}`,
                'PUT',
                {
                    nombre: 'LIBRE A',
                    descripcion: 'Descripción modificada'
                }
            );

            assert.equal(
                modificada.categoria.id,
                categoriaA
            );

            assert.equal(
                modificada.categoria.nombre,
                'LIBRE A'
            );

            assert.equal(
                modificada.categoria.descripcion,
                'Descripción modificada'
            );

            assert.equal(
                modificada.categoria.estado,
                'ACTIVA'
            );

            const sinDescripcion = await operar(
                `${rutaA}/${categoriaA}`,
                'PUT',
                { descripcion: null }
            );

            assert.equal(
                sinDescripcion.categoria.descripcion,
                null
            );

            assert.equal(
                sinDescripcion.categoria.nombre,
                'LIBRE A'
            );

            await operar(
                `${rutaA}/${categoriaA}`,
                'PUT',
                { edicion_id: edicionB },
                400
            );

            await operar(
                `${rutaA}/${categoriaA}`,
                'PUT',
                { estado: 'ARCHIVADA' },
                400
            );

            t.diagnostic(
                '15 — Edición parcial, descripción opcional e identidad inmutable.'
            );


            /* ======================================
               16 - ARCHIVADO Y REACTIVACION
               ====================================== */

            const archivada = await operar(
                `${rutaA}/${categoriaB}/estado`,
                'PATCH',
                { estado: 'ARCHIVADA' }
            );

            assert.equal(
                archivada.categoria.estado,
                'ARCHIVADA'
            );

            assert.equal(
                archivada.categoria.nombre,
                'SENIOR'
            );

            await comprobarIndicadores(
                rutaA,
                2,
                1,
                1
            );

            await operar(
                rutaA,
                'POST',
                { nombre: 'senior' },
                409
            );

            const reactivada = await operar(
                `${rutaA}/${categoriaB}/estado`,
                'PATCH',
                { estado: 'ACTIVA' }
            );

            assert.equal(
                reactivada.categoria.estado,
                'ACTIVA'
            );

            await comprobarIndicadores(
                rutaA,
                2,
                2,
                0
            );

            await operar(
                `${rutaA}/${categoriaB}/estado`,
                'PATCH',
                { estado: 'ARCHIVADA' }
            );

            t.diagnostic(
                '16 — Archivado, reactivación y reserva del nombre.'
            );


            /* ======================================
               17 - FILTROS Y BUSQUEDA
               ====================================== */

            const activas = await operar(
                `${rutaA}?estado=ACTIVA`
            );

            assert.equal(activas.total, 1);

            assert.equal(
                activas.categorias[0].id,
                categoriaA
            );

            assert.deepEqual(
                activas.indicadores,
                {
                    total: 2,
                    activas: 1,
                    archivadas: 1
                }
            );

            const archivadas = await operar(
                `${rutaA}?estado=ARCHIVADA`
            );

            assert.equal(
                archivadas.total,
                1
            );

            assert.equal(
                archivadas.categorias[0].id,
                categoriaB
            );

            const busqueda = await operar(
                `${rutaA}?busqueda=libre`
            );

            assert.equal(
                busqueda.total,
                1
            );

            assert.equal(
                busqueda.categorias[0].id,
                categoriaA
            );

            await operar(
                `${rutaA}/${categoriaA}`,
                'PUT',
                {
                    descripcion: 'Competición amateur'
                }
            );

            const porDescripcion = await operar(
                `${rutaA}?busqueda=competicion`
            );

            assert.equal(
                porDescripcion.total,
                1
            );

            assert.equal(
                porDescripcion.categorias[0].id,
                categoriaA
            );

            await operar(
                `${rutaA}?estado=INEXISTENTE`,
                'GET',
                undefined,
                400
            );

            await operar(
                `${rutaA}?filtroDesconocido=1`,
                'GET',
                undefined,
                400
            );

            t.diagnostic(
                '17 — Filtros, búsqueda y totales generales correctos.'
            );


            /* ======================================
               18 - ESTADOS INVALIDOS
               ====================================== */

            for (const datos of [
                {},
                { estado: 'FINALIZADA' },
                { estado: 'EN_CURSO' },
                { estado: '' },
                { estado: 123 },
                {
                    estado: 'ACTIVA',
                    nombre: 'NO MODIFICAR'
                }
            ]) {

                await operar(
                    `${rutaA}/${categoriaB}/estado`,
                    'PATCH',
                    datos,
                    400
                );
            }

            t.diagnostic(
                '18 — Cambios de estado inválidos rechazados.'
            );


            /* ======================================
               19 - EDICION EN CURSO
               ====================================== */

            await operar(
                `/torneos/${torneoA}/ediciones/${edicionA}/estado`,
                'PATCH',
                { estado: 'EN_CURSO' }
            );

            const temporal = await crearCategoria(
                rutaA,
                'TEMPORAL EN CURSO'
            );

            await operar(
                `${rutaA}/${temporal.id}`,
                'DELETE'
            );

            t.diagnostic(
                '19 — Creación de categorías permitida en una edición en curso.'
            );


            /* ======================================
               20 - EDICION FINALIZADA
               ====================================== */

            await operar(
                `/torneos/${torneoA}/ediciones/${edicionA}/estado`,
                'PATCH',
                { estado: 'FINALIZADA' }
            );

            const finalizada = await comprobarIndicadores(
                rutaA,
                2,
                1,
                1
            );

            assert.equal(
                finalizada.edicion.estado,
                'FINALIZADA'
            );

            await operar(
                rutaA,
                'POST',
                { nombre: 'NO PERMITIDA' },
                409
            );

            await operar(
                `${rutaA}/${categoriaB}/estado`,
                'PATCH',
                { estado: 'ACTIVA' },
                409
            );

            const editada = await operar(
                `${rutaA}/${categoriaA}`,
                'PUT',
                {
                    descripcion: 'Editada tras finalizar'
                }
            );

            assert.equal(
                editada.categoria.descripcion,
                'Editada tras finalizar'
            );

            await operar(
                `${rutaA}/${categoriaA}/estado`,
                'PATCH',
                { estado: 'ARCHIVADA' }
            );

            await comprobarIndicadores(
                rutaA,
                2,
                0,
                2
            );

            await operar(
                `${rutaA}/${categoriaB}`,
                'DELETE'
            );

            await comprobarIndicadores(
                rutaA,
                1,
                0,
                1
            );

            t.diagnostic(
                '20 — Restricciones de edición finalizada y operaciones permitidas.'
            );


            /* ======================================
               21 - REAPERTURA DE EDICION
               ====================================== */

            await operar(
                `/torneos/${torneoA}/ediciones/${edicionA}/estado`,
                'PATCH',
                { estado: 'EN_CURSO' }
            );

            await operar(
                `${rutaA}/${categoriaA}/estado`,
                'PATCH',
                { estado: 'ACTIVA' }
            );

            await comprobarIndicadores(
                rutaA,
                1,
                1,
                0
            );

            t.diagnostic(
                '21 — Reapertura y recuperación de operaciones.'
            );


            /* ======================================
               22 - TORNEO ARCHIVADO
               ====================================== */

            await operar(
                `/torneos/${torneoA}/estado`,
                'PATCH',
                { estado: 'ARCHIVADO' }
            );

            const torneoArchivado = await operar(
                rutaA
            );

            assert.equal(
                torneoArchivado.torneo.estado,
                'ARCHIVADO'
            );

            assert.equal(
                torneoArchivado.categorias[0].estado,
                'ACTIVA'
            );

            await operar(
                rutaA,
                'POST',
                { nombre: 'NO PERMITIDA' },
                409
            );

            await operar(
                `${rutaA}/${categoriaA}`,
                'PUT',
                {
                    descripcion: 'Editada con torneo archivado'
                }
            );

            await operar(
                `${rutaA}/${categoriaA}/estado`,
                'PATCH',
                { estado: 'ARCHIVADA' }
            );

            await operar(
                `${rutaA}/${categoriaA}/estado`,
                'PATCH',
                { estado: 'ACTIVA' },
                409
            );

            await operar(
                `${rutaA}/${categoriaA}/estado`,
                'PATCH',
                { estado: 'ARCHIVADA' }
            );

            await operar(
                `${rutaB}/${categoriaC}`,
                'DELETE'
            );

            await comprobarIndicadores(
                rutaB,
                0,
                0,
                0
            );

            await comprobarIndicadores(
                rutaC,
                1,
                1,
                0
            );

            t.diagnostic(
                '22 — Torneo archivado: restricciones y ausencia de cascadas.'
            );


            /* ======================================
               23 - REACTIVACION DEL TORNEO
               ====================================== */

            await operar(
                `/torneos/${torneoA}/estado`,
                'PATCH',
                { estado: 'ACTIVO' }
            );

            await operar(
                `${rutaA}/${categoriaA}/estado`,
                'PATCH',
                { estado: 'ACTIVA' }
            );

            await comprobarIndicadores(
                rutaA,
                1,
                1,
                0
            );

            t.diagnostic(
                '23 — Reactivación del torneo y de sus categorías.'
            );


            /* ======================================
               24 - INTEGRIDAD REFERENCIAL
               ====================================== */

            await operar(
                `/torneos/${torneoA}/ediciones/${edicionA}`,
                'DELETE',
                undefined,
                409
            );

            await assert.rejects(
                async () => {

                    await pool.execute(
                        `
                            DELETE FROM ediciones
                            WHERE id = ?
                              AND torneo_id = ?
                        `,
                        [edicionA, torneoA]
                    );

                },
                error =>
                    error.code === 'ER_ROW_IS_REFERENCED_2'
            );

            await comprobarIndicadores(
                rutaA,
                1,
                1,
                0
            );

            t.diagnostic(
                '24 — MySQL impide eliminar una edición con categorías.'
            );


            /* ======================================
               25 - PERSISTENCIA REAL
               ====================================== */

            const [registros] = await pool.execute(
                `
                    SELECT
                        id,
                        edicion_id,
                        nombre,
                        descripcion,
                        estado,
                        fecha_creacion,
                        fecha_actualizacion
                    FROM categorias
                    WHERE id IN (?, ?, ?, ?)
                `,
                [
                    categoriaA,
                    categoriaB,
                    categoriaC,
                    categoriaD
                ]
            );

            assert.equal(
                registros.length,
                2
            );

            const registroA = registros.find(
                registro =>
                    registro.id === categoriaA
            );

            const registroD = registros.find(
                registro =>
                    registro.id === categoriaD
            );

            assert.ok(registroA);

            assert.ok(registroD);

            assert.equal(
                registroA.edicion_id,
                edicionA
            );

            assert.equal(
                registroA.nombre,
                'LIBRE A'
            );

            assert.equal(
                registroA.descripcion,
                'Editada con torneo archivado'
            );

            assert.equal(
                registroA.estado,
                'ACTIVA'
            );

            assert.equal(
                registroD.edicion_id,
                edicionC
            );

            assert.equal(
                registroD.nombre,
                'LIBRE'
            );

            assert.equal(
                registroD.estado,
                'ACTIVA'
            );

            assert.ok(
                registroA.fecha_creacion
            );

            assert.ok(
                registroA.fecha_actualizacion
            );

            assert.ok(
                new Date(registroA.fecha_actualizacion) >=
                new Date(registroA.fecha_creacion)
            );

            t.diagnostic(
                '25 — Persistencia efectiva y consistencia de datos en MySQL.'
            );


            /* ======================================
               26 - ELIMINACION DEFINITIVA
               ====================================== */

            await operar(
                `${rutaA}/${categoriaA}`,
                'DELETE'
            );

            await operar(
                `${rutaA}/${categoriaA}`,
                'GET',
                undefined,
                404
            );

            await operar(
                `${rutaA}/${categoriaA}`,
                'DELETE',
                undefined,
                404
            );

            await comprobarIndicadores(
                rutaA,
                0,
                0,
                0
            );

            const recreada = await crearCategoria(
                rutaA,
                'LIBRE A'
            );

            assert.notEqual(
                recreada.id,
                categoriaA
            );

            await operar(
                `${rutaA}/${recreada.id}`,
                'DELETE'
            );

            await comprobarIndicadores(
                rutaC,
                1,
                1,
                0
            );

            t.diagnostic(
                '26 — Eliminación definitiva y liberación del nombre.'
            );


            /* ======================================
               27 - ELIMINACION DE PADRES VACIOS
               ====================================== */

            await operar(
                `/torneos/${torneoA}/ediciones/${edicionA}`,
                'DELETE'
            );

            await operar(
                rutaA,
                'GET',
                undefined,
                404
            );

            await operar(
                `/torneos/${torneoA}/ediciones/${edicionB}`,
                'DELETE'
            );

            await operar(
                `/torneos/${torneoA}`,
                'DELETE'
            );

            await comprobarIndicadores(
                rutaC,
                1,
                1,
                0
            );

            t.diagnostic(
                '27 — Eliminación de contextos vacíos sin afectar otros torneos.'
            );


            /* ======================================
               28 - CIERRE DE SESION
               ====================================== */

            await operar(
                '/auth/logout',
                'POST'
            );

            const accesoPosterior =
                await solicitud(
                    rutaC,
                    { cookie }
                );

            assert.equal(
                accesoPosterior.status,
                401
            );

            cookie = null;

            t.diagnostic(
                '28 — Cierre de sesión e invalidación de acceso.'
            );


        } finally {

            try {

                /* CERRAR SESION ANTE ERRORES */

                if (cookie && sesionVerificada) {

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

                if (baseVerificada && sesionVerificada) {

                    const conexion =
                        await pool.getConnection();

                    try {

                        const [bases] =
                            await conexion.query(
                                'SELECT DATABASE() AS nombre'
                            );

                        assert.equal(
                            bases[0].nombre,
                            BASE_PRUEBAS
                        );

                        await conexion.beginTransaction();

                        await conexion.execute(
                            `
                                DELETE c
                                FROM categorias AS c
                                INNER JOIN ediciones AS e
                                    ON e.id = c.edicion_id
                                INNER JOIN torneos AS t
                                    ON t.id = e.torneo_id
                                WHERE t.nombre IN (?, ?)
                            `,
                            [
                                nombreTorneoA,
                                nombreTorneoB
                            ]
                        );

                        await conexion.execute(
                            `
                                DELETE e
                                FROM ediciones AS e
                                INNER JOIN torneos AS t
                                    ON t.id = e.torneo_id
                                WHERE t.nombre IN (?, ?)
                            `,
                            [
                                nombreTorneoA,
                                nombreTorneoB
                            ]
                        );

                        await conexion.execute(
                            `
                                DELETE FROM torneos
                                WHERE nombre IN (?, ?)
                            `,
                            [
                                nombreTorneoA,
                                nombreTorneoB
                            ]
                        );

                        await conexion.commit();

                        const [restantes] =
                            await conexion.execute(
                                `
                                    SELECT COUNT(*) AS total
                                    FROM torneos
                                    WHERE nombre IN (?, ?)
                                `,
                                [
                                    nombreTorneoA,
                                    nombreTorneoB
                                ]
                            );

                        assert.equal(
                            Number(restantes[0].total),
                            0
                        );

                        t.diagnostic(
                            'LIMPIEZA — Registros ficticios eliminados correctamente.'
                        );

                    } catch (error) {

                        await conexion.rollback();

                        throw error;

                    } finally {

                        conexion.release();

                    }
                }

            } finally {

                await pool.end();

            }
        }
    }
);