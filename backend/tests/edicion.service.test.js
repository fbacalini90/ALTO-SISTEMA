
const { test, after } = require('node:test');

const assert = require('node:assert/strict');

const { pool } = require('../src/config/database');

const repository =
    require('../src/repositories/edicion.repository');

const service =
    require('../src/services/edicion.service');

const { EdicionError, ESTADOS } = service;


/* ==================================================
   DATOS DE PRUEBA
   ================================================== */

function crearEdicionBase(cambios = {}) {

    return {
        id: 11,
        torneo_id: 1,
        nombre: 'NOCTURNO 2027',
        descripcion: null,
        fecha_inicio: null,
        fecha_finalizacion: null,
        estado: ESTADOS.PLANIFICADA,
        fecha_creacion: '2026-11-28T03:00:00.000Z',
        fecha_actualizacion: '2026-11-28T03:00:00.000Z',
        ...cambios
    };

}


/* ==================================================
   REPOSITORIO SIMULADO
   ================================================== */

function prepararRepositorio(t, opciones = {}) {

    const torneos = opciones.torneos ?? [
        {
            id: 1,
            nombre: 'NOCTURNO',
            estado: 'ACTIVO'
        },
        {
            id: 2,
            nombre: 'DIURNO',
            estado: 'ACTIVO'
        }
    ];

    let ediciones = (
        opciones.ediciones ?? [
            crearEdicionBase()
        ]
    ).map((edicion) => ({
        ...edicion
    }));

    let siguienteId = 100;

    const conexion = {};

    const buscarTorneo = (id) =>
        torneos.find(
            (torneo) => torneo.id === id
        ) || null;

    const buscarEdicion = (torneoId, edicionId) =>
        ediciones.find(
            (edicion) =>
                edicion.torneo_id === torneoId &&
                edicion.id === edicionId
        ) || null;

    t.mock.method(
        repository,
        'conTransaccion',
        async (operacion) =>
            operacion(conexion)
    );

    t.mock.method(
        repository,
        'obtenerTorneo',
        async (torneoId) =>
            buscarTorneo(torneoId)
    );

    t.mock.method(
        repository,
        'bloquearTorneo',
        async (torneoId) =>
            buscarTorneo(torneoId)
    );

    t.mock.method(
        repository,
        'listar',
        async (torneoId, filtros = {}) => {

            return ediciones.filter((edicion) => {

                const coincideTorneo =
                    edicion.torneo_id === torneoId;

                const coincideEstado =
                    !filtros.estado ||
                    edicion.estado === filtros.estado;

                const texto =
                    String(filtros.busqueda || '')
                        .toLowerCase();

                const coincideBusqueda =
                    edicion.nombre
                        .toLowerCase()
                        .includes(texto) ||
                    String(edicion.descripcion || '')
                        .toLowerCase()
                        .includes(texto);

                return (
                    coincideTorneo &&
                    coincideEstado &&
                    coincideBusqueda
                );

            });

        }
    );

    t.mock.method(
        repository,
        'obtenerPorId',
        async (torneoId, edicionId) => {

            const edicion = buscarEdicion(
                torneoId,
                edicionId
            );

            return edicion
                ? { ...edicion }
                : null;

        }
    );

    t.mock.method(
        repository,
        'crear',
        async (torneoId, datos) => {

            if (opciones.errorCrear) {
                throw opciones.errorCrear;
            }

            const id = siguienteId++;

            ediciones.push(
                crearEdicionBase({
                    ...datos,
                    id,
                    torneo_id: torneoId,
                    estado: ESTADOS.PLANIFICADA
                })
            );

            return id;

        }
    );

    t.mock.method(
        repository,
        'actualizar',
        async (torneoId, edicionId, datos) => {

            if (opciones.errorActualizar) {
                throw opciones.errorActualizar;
            }

            const edicion = buscarEdicion(
                torneoId,
                edicionId
            );

            if (!edicion) {
                return 0;
            }

            Object.assign(edicion, datos);

            return 1;

        }
    );

    t.mock.method(
        repository,
        'cambiarEstado',
        async (torneoId, edicionId, estado) => {

            if (opciones.errorEstado) {
                throw opciones.errorEstado;
            }

            const edicion = buscarEdicion(
                torneoId,
                edicionId
            );

            if (!edicion) {
                return 0;
            }

            edicion.estado = estado;

            return 1;

        }
    );

    t.mock.method(
        repository,
        'eliminar',
        async (torneoId, edicionId) => {

            if (opciones.errorEliminar) {
                throw opciones.errorEliminar;
            }

            const cantidadAnterior =
                ediciones.length;

            ediciones = ediciones.filter(
                (edicion) =>
                    !(
                        edicion.torneo_id === torneoId &&
                        edicion.id === edicionId
                    )
            );

            return cantidadAnterior - ediciones.length;

        }
    );

    t.mock.method(
        repository,
        'obtenerIndicadores',
        async (torneoId) => {

            const registros = ediciones.filter(
                (edicion) =>
                    edicion.torneo_id === torneoId
            );

            return {
                total: registros.length,

                planificadas: registros.filter(
                    (edicion) =>
                        edicion.estado === ESTADOS.PLANIFICADA
                ).length,

                en_curso: registros.filter(
                    (edicion) =>
                        edicion.estado === ESTADOS.EN_CURSO
                ).length,

                finalizadas: registros.filter(
                    (edicion) =>
                        edicion.estado === ESTADOS.FINALIZADA
                ).length
            };

        }
    );

    return {
        conexion,
        obtenerRegistros: () => ediciones
    };

}


/* ==================================================
   FUNCIONES AUXILIARES
   ================================================== */

async function verificarError(
    operacion,
    status,
    patron = null
) {

    await assert.rejects(
        operacion,
        (error) => {

            assert.ok(
                error instanceof EdicionError
            );

            assert.equal(
                error.status,
                status
            );

            if (patron) {

                assert.match(
                    error.message,
                    patron
                );

            }

            return true;

        }
    );

}


function errorMySQL(code) {

    const error = new Error(
        'Error simulado de MySQL'
    );

    error.code = code;

    return error;

}


function torneoArchivado() {

    return [
        {
            id: 1,
            nombre: 'NOCTURNO',
            estado: 'ARCHIVADO'
        }
    ];

}


/* ==================================================
   CREACION
   ================================================== */

test('EDICIONES: crea una edición planificada', async (t) => {

    prepararRepositorio(t);

    const edicion = await service.crearEdicion(
        1,
        {
            nombre: '  NOCTURNO   2028  '
        }
    );

    assert.equal(edicion.id, 100);
    assert.equal(edicion.torneo_id, 1);
    assert.equal(edicion.nombre, 'NOCTURNO 2028');
    assert.equal(edicion.estado, ESTADOS.PLANIFICADA);
    assert.equal(edicion.descripcion, null);
    assert.equal(edicion.fecha_inicio, null);
    assert.equal(edicion.fecha_finalizacion, null);

    assert.equal(
        repository.bloquearTorneo.mock.callCount(),
        1
    );

});


test('EDICIONES: normaliza nombre y descripción', async (t) => {

    prepararRepositorio(t);

    const edicion = await service.crearEdicion(
        1,
        {
            nombre: '  COPA   DE VERANO  ',
            descripcion: '  Competición de verano  '
        }
    );

    assert.equal(
        edicion.nombre,
        'COPA DE VERANO'
    );

    assert.equal(
        edicion.descripcion,
        'Competición de verano'
    );

});


test('EDICIONES: rechaza nombres vacíos', async (t) => {

    prepararRepositorio(t);

    for (const nombre of [
        undefined,
        null,
        '',
        '   ',
        2027
    ]) {

        await verificarError(
            () => service.crearEdicion(
                1,
                { nombre }
            ),
            400,
            /nombre/i
        );

    }

    assert.equal(
        repository.crear.mock.callCount(),
        0
    );

});


test('EDICIONES: rechaza nombres superiores a 100 caracteres', async (t) => {

    prepararRepositorio(t);

    await verificarError(
        () => service.crearEdicion(
            1,
            {
                nombre: 'A'.repeat(101)
            }
        ),
        400,
        /100/
    );

});


test('EDICIONES: rechaza descripciones superiores a 500 caracteres', async (t) => {

    prepararRepositorio(t);

    await verificarError(
        () => service.crearEdicion(
            1,
            {
                nombre: 'COPA 2027',
                descripcion: 'A'.repeat(501)
            }
        ),
        400,
        /500/
    );

});


test('EDICIONES: admite los límites máximos de texto', async (t) => {

    prepararRepositorio(t);

    const edicion = await service.crearEdicion(
        1,
        {
            nombre: 'A'.repeat(100),
            descripcion: 'B'.repeat(500)
        }
    );

    assert.equal(edicion.nombre.length, 100);
    assert.equal(edicion.descripcion.length, 500);

});


test('EDICIONES: rechaza campos no permitidos', async (t) => {

    prepararRepositorio(t);

    for (const campos of [
        { anio: 2027 },
        { torneo_id: 2 },
        { estado: 'EN_CURSO' },
        { id: 500 }
    ]) {

        await verificarError(
            () => service.crearEdicion(
                1,
                {
                    nombre: 'COPA 2027',
                    ...campos
                }
            ),
            400,
            /no permitidos/i
        );

    }

});


test('EDICIONES: transforma duplicados en conflicto 409', async (t) => {

    prepararRepositorio(t, {
        errorCrear: errorMySQL('ER_DUP_ENTRY')
    });

    await verificarError(
        () => service.crearEdicion(
            1,
            {
                nombre: 'NOCTURNO 2027'
            }
        ),
        409,
        /nombre/i
    );

});


test('EDICIONES: permite el mismo nombre en torneos diferentes', async (t) => {

    prepararRepositorio(t);

    const primera = await service.crearEdicion(
        1,
        {
            nombre: 'COPA DE VERANO 2027'
        }
    );

    const segunda = await service.crearEdicion(
        2,
        {
            nombre: 'COPA DE VERANO 2027'
        }
    );

    assert.equal(primera.nombre, segunda.nombre);
    assert.notEqual(primera.id, segunda.id);
    assert.notEqual(
        primera.torneo_id,
        segunda.torneo_id
    );

});


/* ==================================================
   FECHAS
   ================================================== */

test('EDICIONES: admite fechas opcionales e independientes', async (t) => {

    prepararRepositorio(t);

    const casos = [
        {
            inicio: null,
            finalizacion: null
        },
        {
            inicio: '2027-01-01',
            finalizacion: null
        },
        {
            inicio: null,
            finalizacion: '2027-12-31'
        },
        {
            inicio: '2027-01-01',
            finalizacion: '2027-12-31'
        }
    ];

    for (const [indice, caso] of casos.entries()) {

        const edicion = await service.crearEdicion(
            1,
            {
                nombre: `EDICIÓN ${indice}`,
                fecha_inicio: caso.inicio,
                fecha_finalizacion: caso.finalizacion
            }
        );

        assert.equal(
            edicion.fecha_inicio,
            caso.inicio
        );

        assert.equal(
            edicion.fecha_finalizacion,
            caso.finalizacion
        );

    }

});


test('EDICIONES: permite inicio y finalización el mismo día', async (t) => {

    prepararRepositorio(t);

    const edicion = await service.crearEdicion(
        1,
        {
            nombre: 'COPA DE UN DÍA',
            fecha_inicio: '2027-02-15',
            fecha_finalizacion: '2027-02-15'
        }
    );

    assert.equal(
        edicion.fecha_inicio,
        edicion.fecha_finalizacion
    );

});


test('EDICIONES: rechaza fechas cronológicamente incorrectas', async (t) => {

    prepararRepositorio(t);

    await verificarError(
        () => service.crearEdicion(
            1,
            {
                nombre: 'COPA 2027',
                fecha_inicio: '2027-12-31',
                fecha_finalizacion: '2027-01-01'
            }
        ),
        400,
        /anterior/i
    );

});


test('EDICIONES: rechaza fechas inexistentes o inválidas', async (t) => {

    prepararRepositorio(t);

    const fechasInvalidas = [
        '2027-02-29',
        '2027-04-31',
        '2027-13-01',
        '2027-00-10',
        '2027-01-00',
        '2027-01-32',
        '01/02/2027',
        '0999-01-01',
        20270101
    ];

    for (const fecha of fechasInvalidas) {

        await verificarError(
            () => service.crearEdicion(
                1,
                {
                    nombre: 'COPA 2027',
                    fecha_inicio: fecha
                }
            ),
            400,
            /fecha/i
        );

    }

});


test('EDICIONES: admite fechas válidas de años bisiestos', async (t) => {

    prepararRepositorio(t);

    const edicion = await service.crearEdicion(
        1,
        {
            nombre: 'COPA 2028',
            fecha_inicio: '2028-02-29'
        }
    );

    assert.equal(
        edicion.fecha_inicio,
        '2028-02-29'
    );

});


test('EDICIONES: las fechas no modifican automáticamente el estado', async (t) => {

    prepararRepositorio(t);

    const edicion = await service.crearEdicion(
        1,
        {
            nombre: 'EDICIÓN HISTÓRICA',
            fecha_inicio: '2000-01-01',
            fecha_finalizacion: '2000-12-31'
        }
    );

    assert.equal(
        edicion.estado,
        ESTADOS.PLANIFICADA
    );

});


/* ==================================================
   LISTADO Y CONSULTA
   ================================================== */

test('EDICIONES: lista exclusivamente las ediciones del torneo', async (t) => {

    prepararRepositorio(t, {
        ediciones: [
            crearEdicionBase(),
            crearEdicionBase({
                id: 12,
                torneo_id: 2,
                nombre: 'DIURNO 2027'
            })
        ]
    });

    const resultado = await service.listarEdiciones(1);

    assert.equal(resultado.torneo.id, 1);
    assert.equal(resultado.total, 1);
    assert.equal(resultado.ediciones[0].id, 11);

});


test('EDICIONES: conserva indicadores generales al aplicar filtros', async (t) => {

    prepararRepositorio(t, {
        ediciones: [
            crearEdicionBase(),
            crearEdicionBase({
                id: 12,
                estado: ESTADOS.EN_CURSO
            }),
            crearEdicionBase({
                id: 13,
                estado: ESTADOS.FINALIZADA
            })
        ]
    });

    const resultado = await service.listarEdiciones(
        1,
        {
            estado: ' en_curso '
        }
    );

    assert.equal(resultado.total, 1);

    assert.equal(
        resultado.ediciones[0].estado,
        ESTADOS.EN_CURSO
    );

    assert.deepEqual(
        resultado.indicadores,
        {
            total: 3,
            planificadas: 1,
            en_curso: 1,
            finalizadas: 1
        }
    );

});


test('EDICIONES: normaliza términos de búsqueda', async (t) => {

    prepararRepositorio(t);

    await service.listarEdiciones(
        1,
        {
            busqueda: '  NOCTURNO   2027  '
        }
    );

    const llamada =
        repository.listar.mock.calls[0];

    assert.equal(
        llamada.arguments[1].busqueda,
        'NOCTURNO 2027'
    );

});


test('EDICIONES: rechaza filtros inválidos', async (t) => {

    prepararRepositorio(t);

    for (const filtros of [
        { estado: 'ACTIVA' },
        { busqueda: 2027 },
        { busqueda: 'A'.repeat(501) },
        { anio: 2027 }
    ]) {

        await verificarError(
            () => service.listarEdiciones(
                1,
                filtros
            ),
            400
        );

    }

});


test('EDICIONES: consulta una edición existente', async (t) => {

    prepararRepositorio(t);

    const edicion = await service.obtenerEdicion(
        1,
        11
    );

    assert.equal(edicion.id, 11);
    assert.equal(edicion.torneo_id, 1);

});


test('EDICIONES: rechaza torneos inexistentes', async (t) => {

    prepararRepositorio(t);

    await verificarError(
        () => service.listarEdiciones(999),
        404,
        /torneo/i
    );

});


test('EDICIONES: impide consultar ediciones de otro torneo', async (t) => {

    prepararRepositorio(t);

    await verificarError(
        () => service.obtenerEdicion(2, 11),
        404,
        /edición/i
    );

});


test('EDICIONES: rechaza identificadores inválidos', async (t) => {

    prepararRepositorio(t);

    const identificadores = [
        0,
        -1,
        1.5,
        null,
        '',
        'abc',
        '1 OR 1=1',
        2147483648
    ];

    for (const id of identificadores) {

        await verificarError(
            () => service.obtenerEdicion(id, 11),
            400
        );

        await verificarError(
            () => service.obtenerEdicion(1, id),
            400
        );

    }

});


/* ==================================================
   ACTUALIZACION
   ================================================== */

test('EDICIONES: modifica nombre y descripción', async (t) => {

    prepararRepositorio(t);

    const edicion = await service.actualizarEdicion(
        1,
        11,
        {
            nombre: 'NOCTURNO ESPECIAL 2027',
            descripcion: 'Nueva descripción'
        }
    );

    assert.equal(
        edicion.nombre,
        'NOCTURNO ESPECIAL 2027'
    );

    assert.equal(
        edicion.descripcion,
        'Nueva descripción'
    );

    assert.equal(edicion.torneo_id, 1);

});


test('EDICIONES: modifica y elimina fechas existentes', async (t) => {

    prepararRepositorio(t, {
        ediciones: [
            crearEdicionBase({
                fecha_inicio: '2027-01-01',
                fecha_finalizacion: '2027-12-31'
            })
        ]
    });

    const modificada = await service.actualizarEdicion(
        1,
        11,
        {
            fecha_inicio: '2027-02-01'
        }
    );

    assert.equal(
        modificada.fecha_inicio,
        '2027-02-01'
    );

    assert.equal(
        modificada.fecha_finalizacion,
        '2027-12-31'
    );

    const eliminadas = await service.actualizarEdicion(
        1,
        11,
        {
            fecha_inicio: null,
            fecha_finalizacion: ''
        }
    );

    assert.equal(eliminadas.fecha_inicio, null);
    assert.equal(eliminadas.fecha_finalizacion, null);

});


test('EDICIONES: valida fechas en actualizaciones parciales', async (t) => {

    prepararRepositorio(t, {
        ediciones: [
            crearEdicionBase({
                fecha_inicio: '2027-06-01',
                fecha_finalizacion: '2027-12-31'
            })
        ]
    });

    await verificarError(
        () => service.actualizarEdicion(
            1,
            11,
            {
                fecha_finalizacion: '2027-01-01'
            }
        ),
        400,
        /anterior/i
    );

    assert.equal(
        repository.actualizar.mock.callCount(),
        0
    );

});


test('EDICIONES: evita escrituras si no existen cambios', async (t) => {

    prepararRepositorio(t);

    const edicion = await service.actualizarEdicion(
        1,
        11,
        {
            nombre: 'NOCTURNO 2027'
        }
    );

    assert.equal(edicion.id, 11);

    assert.equal(
        repository.actualizar.mock.callCount(),
        0
    );

});


test('EDICIONES: impide cambiar el torneo asociado', async (t) => {

    prepararRepositorio(t);

    await verificarError(
        () => service.actualizarEdicion(
            1,
            11,
            {
                torneo_id: 2
            }
        ),
        400
    );

});


test('EDICIONES: impide editar registros de otro torneo', async (t) => {

    prepararRepositorio(t);

    await verificarError(
        () => service.actualizarEdicion(
            2,
            11,
            {
                nombre: 'MODIFICADA'
            }
        ),
        404
    );

});


test('EDICIONES: rechaza nombres duplicados al editar', async (t) => {

    prepararRepositorio(t, {
        errorActualizar: errorMySQL('ER_DUP_ENTRY')
    });

    await verificarError(
        () => service.actualizarEdicion(
            1,
            11,
            {
                nombre: 'OTRA EDICIÓN'
            }
        ),
        409
    );

});


/* ==================================================
   ESTADOS DEPORTIVOS
   ================================================== */

test('EDICIONES: inicia una edición planificada', async (t) => {

    prepararRepositorio(t);

    const edicion = await service.cambiarEstadoEdicion(
        1,
        11,
        {
            estado: ESTADOS.EN_CURSO
        }
    );

    assert.equal(
        edicion.estado,
        ESTADOS.EN_CURSO
    );

    assert.equal(edicion.fecha_inicio, null);

});


test('EDICIONES: finaliza una edición en curso', async (t) => {

    prepararRepositorio(t, {
        ediciones: [
            crearEdicionBase({
                estado: ESTADOS.EN_CURSO
            })
        ]
    });

    const edicion = await service.cambiarEstadoEdicion(
        1,
        11,
        {
            estado: ESTADOS.FINALIZADA
        }
    );

    assert.equal(
        edicion.estado,
        ESTADOS.FINALIZADA
    );

    assert.equal(edicion.fecha_finalizacion, null);

});


test('EDICIONES: permite reabrir una edición finalizada', async (t) => {

    prepararRepositorio(t, {
        ediciones: [
            crearEdicionBase({
                estado: ESTADOS.FINALIZADA
            })
        ]
    });

    const edicion = await service.cambiarEstadoEdicion(
        1,
        11,
        {
            estado: ESTADOS.EN_CURSO
        }
    );

    assert.equal(
        edicion.estado,
        ESTADOS.EN_CURSO
    );

});


test('EDICIONES: permite varias ediciones simultáneas en curso', async (t) => {

    prepararRepositorio(t, {
        ediciones: [
            crearEdicionBase(),
            crearEdicionBase({
                id: 12,
                nombre: 'NOCTURNO ESPECIAL 2027'
            })
        ]
    });

    await service.cambiarEstadoEdicion(
        1,
        11,
        {
            estado: ESTADOS.EN_CURSO
        }
    );

    await service.cambiarEstadoEdicion(
        1,
        12,
        {
            estado: ESTADOS.EN_CURSO
        }
    );

    const resultado = await service.listarEdiciones(1);

    assert.equal(
        resultado.indicadores.en_curso,
        2
    );

});


test('EDICIONES: rechaza finalizar directamente una edición planificada', async (t) => {

    prepararRepositorio(t);

    await verificarError(
        () => service.cambiarEstadoEdicion(
            1,
            11,
            {
                estado: ESTADOS.FINALIZADA
            }
        ),
        409
    );

});


test('EDICIONES: rechaza volver de EN_CURSO a PLANIFICADA', async (t) => {

    prepararRepositorio(t, {
        ediciones: [
            crearEdicionBase({
                estado: ESTADOS.EN_CURSO
            })
        ]
    });

    await verificarError(
        () => service.cambiarEstadoEdicion(
            1,
            11,
            {
                estado: ESTADOS.PLANIFICADA
            }
        ),
        409
    );

});


test('EDICIONES: rechaza volver de FINALIZADA a PLANIFICADA', async (t) => {

    prepararRepositorio(t, {
        ediciones: [
            crearEdicionBase({
                estado: ESTADOS.FINALIZADA
            })
        ]
    });

    await verificarError(
        () => service.cambiarEstadoEdicion(
            1,
            11,
            {
                estado: ESTADOS.PLANIFICADA
            }
        ),
        409
    );

});


test('EDICIONES: repetir el estado actual no produce cambios', async (t) => {

    prepararRepositorio(t);

    const edicion = await service.cambiarEstadoEdicion(
        1,
        11,
        {
            estado: ESTADOS.PLANIFICADA
        }
    );

    assert.equal(
        edicion.estado,
        ESTADOS.PLANIFICADA
    );

    assert.equal(
        repository.cambiarEstado.mock.callCount(),
        0
    );

});


test('EDICIONES: rechaza estados deportivos inexistentes', async (t) => {

    prepararRepositorio(t);

    await verificarError(
        () => service.cambiarEstadoEdicion(
            1,
            11,
            {
                estado: 'ARCHIVADA'
            }
        ),
        400
    );

});


test('EDICIONES: impide modificar el estado de una edición ajena', async (t) => {

    prepararRepositorio(t);

    await verificarError(
        () => service.cambiarEstadoEdicion(
            2,
            11,
            {
                estado: ESTADOS.EN_CURSO
            }
        ),
        404
    );

});


/* ==================================================
   TORNEOS ARCHIVADOS
   ================================================== */

test('EDICIONES: permite consultar un torneo archivado', async (t) => {

    prepararRepositorio(t, {
        torneos: torneoArchivado()
    });

    const resultado = await service.listarEdiciones(1);

    assert.equal(
        resultado.torneo.estado,
        'ARCHIVADO'
    );

    assert.equal(resultado.total, 1);

});


test('EDICIONES: impide crear en un torneo archivado', async (t) => {

    prepararRepositorio(t, {
        torneos: torneoArchivado()
    });

    await verificarError(
        () => service.crearEdicion(
            1,
            {
                nombre: 'NUEVA EDICIÓN'
            }
        ),
        409,
        /archivado/i
    );

});


test('EDICIONES: impide iniciar en un torneo archivado', async (t) => {

    prepararRepositorio(t, {
        torneos: torneoArchivado()
    });

    await verificarError(
        () => service.cambiarEstadoEdicion(
            1,
            11,
            {
                estado: ESTADOS.EN_CURSO
            }
        ),
        409,
        /archivado/i
    );

});


test('EDICIONES: impide reabrir en un torneo archivado', async (t) => {

    prepararRepositorio(t, {
        torneos: torneoArchivado(),
        ediciones: [
            crearEdicionBase({
                estado: ESTADOS.FINALIZADA
            })
        ]
    });

    await verificarError(
        () => service.cambiarEstadoEdicion(
            1,
            11,
            {
                estado: ESTADOS.EN_CURSO
            }
        ),
        409,
        /archivado/i
    );

});


test('EDICIONES: permite finalizar en un torneo archivado', async (t) => {

    prepararRepositorio(t, {
        torneos: torneoArchivado(),
        ediciones: [
            crearEdicionBase({
                estado: ESTADOS.EN_CURSO
            })
        ]
    });

    const edicion = await service.cambiarEstadoEdicion(
        1,
        11,
        {
            estado: ESTADOS.FINALIZADA
        }
    );

    assert.equal(
        edicion.estado,
        ESTADOS.FINALIZADA
    );

});


test('EDICIONES: permite corregir datos históricos de un torneo archivado', async (t) => {

    prepararRepositorio(t, {
        torneos: torneoArchivado(),
        ediciones: [
            crearEdicionBase({
                estado: ESTADOS.FINALIZADA
            })
        ]
    });

    const edicion = await service.actualizarEdicion(
        1,
        11,
        {
            fecha_finalizacion: '2027-12-31'
        }
    );

    assert.equal(
        edicion.fecha_finalizacion,
        '2027-12-31'
    );

    assert.equal(
        edicion.estado,
        ESTADOS.FINALIZADA
    );

});


/* ==================================================
   ELIMINACION DEFINITIVA
   ================================================== */

for (const estado of Object.values(ESTADOS)) {

    test(
        `EDICIONES: permite eliminar sin dependencias en estado ${estado}`,

        async (t) => {

            const simulacion = prepararRepositorio(t, {
                ediciones: [
                    crearEdicionBase({
                        estado
                    })
                ]
            });

            const resultado = await service.eliminarEdicion(
                1,
                11
            );

            assert.deepEqual(
                resultado,
                {
                    id: 11,
                    torneo_id: 1
                }
            );

            assert.equal(
                simulacion.obtenerRegistros().length,
                0
            );

        }
    );

}


test('EDICIONES: permite eliminar sin dependencias en un torneo archivado', async (t) => {

    prepararRepositorio(t, {
        torneos: torneoArchivado()
    });

    await service.eliminarEdicion(
        1,
        11
    );

    const resultado = await service.listarEdiciones(1);

    assert.equal(resultado.total, 0);

});


test('EDICIONES: devuelve 404 al eliminar una edición inexistente', async (t) => {

    prepararRepositorio(t);

    await verificarError(
        () => service.eliminarEdicion(
            1,
            999
        ),
        404
    );

});


test('EDICIONES: impide eliminar una edición de otro torneo', async (t) => {

    const simulacion = prepararRepositorio(t);

    await verificarError(
        () => service.eliminarEdicion(
            2,
            11
        ),
        404
    );

    assert.equal(
        simulacion.obtenerRegistros().length,
        1
    );

});


test('EDICIONES: eliminar una edición no afecta otras ediciones', async (t) => {

    const simulacion = prepararRepositorio(t, {
        ediciones: [
            crearEdicionBase(),
            crearEdicionBase({
                id: 12,
                nombre: 'NOCTURNO 2028'
            }),
            crearEdicionBase({
                id: 13,
                torneo_id: 2,
                nombre: 'DIURNO 2027'
            })
        ]
    });

    await service.eliminarEdicion(
        1,
        11
    );

    assert.deepEqual(
        simulacion.obtenerRegistros().map(
            (edicion) => edicion.id
        ),
        [12, 13]
    );

});


test('EDICIONES: permite reutilizar el nombre de una edición eliminada', async (t) => {

    prepararRepositorio(t);

    await service.eliminarEdicion(
        1,
        11
    );

    const edicion = await service.crearEdicion(
        1,
        {
            nombre: 'NOCTURNO 2027'
        }
    );

    assert.notEqual(edicion.id, 11);

    assert.equal(
        edicion.nombre,
        'NOCTURNO 2027'
    );

});


test('EDICIONES: transforma dependencias existentes en conflicto 409', async (t) => {

    prepararRepositorio(t, {
        errorEliminar: errorMySQL(
            'ER_ROW_IS_REFERENCED_2'
        )
    });

    await verificarError(
        () => service.eliminarEdicion(
            1,
            11
        ),
        409,
        /asociada/i
    );

});


/* ==================================================
   ERRORES DE PERSISTENCIA
   ================================================== */

test('EDICIONES: transforma errores de clave foránea en conflicto 409', async (t) => {

    prepararRepositorio(t, {
        errorCrear: errorMySQL(
            'ER_NO_REFERENCED_ROW_2'
        )
    });

    await verificarError(
        () => service.crearEdicion(
            1,
            {
                nombre: 'COPA 2027'
            }
        ),
        409
    );

});


test('EDICIONES: transforma restricciones CHECK en error 400', async (t) => {

    prepararRepositorio(t, {
        errorCrear: errorMySQL(
            'ER_CHECK_CONSTRAINT_VIOLATED'
        )
    });

    await verificarError(
        () => service.crearEdicion(
            1,
            {
                nombre: 'COPA 2027'
            }
        ),
        400
    );

});


test('EDICIONES: transforma conflictos transaccionales en error 409', async (t) => {

    prepararRepositorio(t, {
        errorCrear: errorMySQL(
            'ER_LOCK_DEADLOCK'
        )
    });

    await verificarError(
        () => service.crearEdicion(
            1,
            {
                nombre: 'COPA 2027'
            }
        ),
        409
    );

});


test('EDICIONES: conserva errores internos inesperados', async (t) => {

    const errorInterno = new Error(
        'Error interno inesperado'
    );

    prepararRepositorio(t, {
        errorCrear: errorInterno
    });

    await assert.rejects(
        () => service.crearEdicion(
            1,
            {
                nombre: 'COPA 2027'
            }
        ),
        (error) => error === errorInterno
    );

});


/* ==================================================
   CIERRE DE RECURSOS
   ================================================== */

after(async () => {

    await pool.end();

});
