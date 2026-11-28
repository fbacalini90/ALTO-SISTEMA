const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { pool } = require('../src/config/database');

/* ==================================================
   ALTO-SISTEMA — HU-005
   INTEGRACIÓN HTTP / MYSQL — EDICIONES
   ================================================== */

const BASE_PRUEBAS = 'altosistemahu004test';
const API_URL = 'http://127.0.0.1:3001/api';
const ORIGEN = 'http://localhost:5173';
const HABILITADO = process.env.ALTO_EDICION_INTEGRATION_TEST === '1';

async function verificarBase() {
    const [filas] = await pool.query('SELECT DATABASE() AS nombre');
    assert.equal(filas[0].nombre, BASE_PRUEBAS,
        'Operación cancelada: la base no es la base aislada de pruebas.');
}

test('HU-005: integración completa de ediciones con HTTP y MySQL', {
    skip: !HABILITADO,
    timeout: 120000
}, async (t) => {
    const prefijo = `HU005-TEST-${randomUUID()}`;
    const nombreA = `${prefijo}-A`;
    const nombreB = `${prefijo}-B`;
    const nombreEdicion = 'Copa de Verano 2027';
    const ruta = (id) => `/torneos/${id}/ediciones`;
    let cookie = '';
    let aislamientoVerificado = false;

    async function solicitar(method, path, { body, autenticado = true,
        origen = ORIGEN, status } = {}) {
        const headers = { Accept: 'application/json', Origin: origen };
        if (autenticado && cookie) headers.Cookie = cookie;
        if (body !== undefined) headers['Content-Type'] = 'application/json';
        const respuesta = await fetch(`${API_URL}${path}`, {
            method, headers,
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: AbortSignal.timeout(10000),
            redirect: 'error'
        });
        const texto = await respuesta.text();
        let datos = null;
        if (texto) {
            try { datos = JSON.parse(texto); } catch { datos = texto; }
        }
        if (status !== undefined) {
            assert.equal(respuesta.status, status,
                `${method} ${path}: esperado ${status}, recibido ${respuesta.status}. ${datos?.mensaje || ''}`);
        }
        return { respuesta, datos };
    }

    async function crearTorneo(nombre) {
        const { datos } = await solicitar('POST', '/torneos', {
            body: { nombre }, status: 201
        });
        assert.ok(Number.isInteger(datos.torneo.id) && datos.torneo.id > 0);
        assert.equal(datos.torneo.nombre, nombre);
        const [filas] = await pool.execute(
            'SELECT id FROM torneos WHERE id = ? AND nombre = ?',
            [datos.torneo.id, nombre]);
        assert.equal(filas.length, 1, 'El torneo debe existir en la base aislada.');
        return datos.torneo.id;
    }

    async function crearEdicion(torneoId, body) {
        const { datos, respuesta } = await solicitar('POST', ruta(torneoId), {
            body, status: 201
        });
        const edicion = datos.edicion;
        assert.ok(Number.isInteger(edicion.id) && edicion.id > 0);
        assert.equal(edicion.torneo_id, torneoId);
        assert.equal(edicion.estado, 'PLANIFICADA');
        assert.equal(respuesta.headers.get('location'),
            `/api${ruta(torneoId)}/${edicion.id}`);
        return edicion;
    }

    async function cambiarEstado(torneoId, edicionId, estado, status = 200) {
        const { datos } = await solicitar('PATCH', `${ruta(torneoId)}/${edicionId}/estado`, {
            body: { estado }, status
        });
        if (status === 200) assert.equal(datos.edicion.estado, estado);
        return datos;
    }

    async function consultar(torneoId, edicionId) {
        const { datos } = await solicitar('GET', `${ruta(torneoId)}/${edicionId}`, { status: 200 });
        return datos.edicion;
    }

    try {
        // No se crean datos deportivos sin verificar primero la base y la sesión.
        await verificarBase();
        assert.equal(process.env.ALTO_TEST_USER, 'admin_pruebas');
        assert.ok(process.env.ALTO_TEST_PASSWORD, 'Falta la contraseña de pruebas.');

        const login = await solicitar('POST', '/auth/login', {
            autenticado: false,
            body: { usuario: process.env.ALTO_TEST_USER, password: process.env.ALTO_TEST_PASSWORD },
            status: 200
        });
        const setCookie = login.respuesta.headers.get('set-cookie');
        assert.ok(setCookie, 'El servidor debe entregar una cookie de sesión.');
        cookie = setCookie.split(';')[0];
        assert.ok(cookie.startsWith('alto.sid='));
        const valor = decodeURIComponent(cookie.slice('alto.sid='.length));
        assert.ok(valor.startsWith('s:') && valor.lastIndexOf('.') > 2);
        const sessionId = valor.slice(2, valor.lastIndexOf('.'));
        const [sesiones] = await pool.execute(
            'SELECT session_id FROM sessions WHERE session_id = ?', [sessionId]);
        assert.equal(sesiones.length, 1, 'La sesión HTTP debe estar en la base aislada.');
        await solicitar('GET', '/auth/me', { status: 200 });
        aislamientoVerificado = true;
        t.diagnostic('01. Base aislada y sesión HTTP verificadas.');

        const a = await crearTorneo(nombreA);
        const b = await crearTorneo(nombreB);
        assert.notEqual(a, b);
        const ra = ruta(a);
        const rb = ruta(b);
        t.diagnostic('02. Dos torneos temporales independientes creados.');

        // Los seis endpoints deben exigir autenticación, incluso con IDs válidos.
        const e1 = await crearEdicion(a, { nombre: nombreEdicion });
        for (const [method, path, body] of [
            ['GET', ra], ['GET', `${ra}/${e1.id}`],
            ['POST', ra, { nombre: 'NO AUTORIZADA' }],
            ['PUT', `${ra}/${e1.id}`, { nombre: 'NO AUTORIZADA' }],
            ['PATCH', `${ra}/${e1.id}/estado`, { estado: 'EN_CURSO' }],
            ['DELETE', `${ra}/${e1.id}`]
        ]) {
            await solicitar(method, path, { body, autenticado: false, status: 401 });
        }
        await solicitar('POST', ra, { body: { nombre: 'ORIGEN NO AUTORIZADO' },
            origen: 'http://origen-no-autorizado.invalid', status: 403 });
        t.diagnostic('03. Seis endpoints protegidos y origen no autorizado rechazado.');

        assert.equal(e1.fecha_inicio, null);
        assert.equal(e1.fecha_finalizacion, null);
        assert.equal(e1.descripcion, null);
        const e2 = await crearEdicion(a, { nombre: 'Copa Especial 2027',
            descripcion: 'Competición de prueba', fecha_inicio: '2027-02-01',
            fecha_finalizacion: '2027-03-01' });
        const e3 = await crearEdicion(b, { nombre: nombreEdicion, fecha_finalizacion: '2027-12-31' });
        assert.equal(e2.fecha_inicio, '2027-02-01');
        assert.equal(e2.fecha_finalizacion, '2027-03-01');
        assert.equal(e3.fecha_inicio, null);
        assert.equal(e3.fecha_finalizacion, '2027-12-31');
        const e4 = await crearEdicion(a, { nombre: 'Copa Bisiesta 2028', fecha_inicio: '2028-02-29' });
        assert.equal(e4.fecha_inicio, '2028-02-29');
        assert.equal(e4.fecha_finalizacion, null);
        t.diagnostic('04. Creación, fechas opcionales y nombre compartido entre torneos.');

        await solicitar('POST', ra, { body: { nombre: '  CÓPA   DE VERANO 2027  ' }, status: 409 });
        await solicitar('PUT', `${ra}/${e2.id}`, { body: { nombre: nombreEdicion }, status: 409 });
        for (const body of [
            { nombre: '  ' }, { nombre: 'A'.repeat(101) },
            { nombre: 'INVALIDA', descripcion: 'A'.repeat(501) },
            { nombre: 'INVALIDA', anio: 2027 },
            { nombre: 'INVALIDA', estado: 'EN_CURSO' },
            { nombre: 'INVALIDA', torneo_id: b },
            { nombre: 'INVALIDA', fecha_inicio: '2027-02-29' },
            { nombre: 'INVALIDA', fecha_inicio: '2027-04-31' },
            { nombre: 'INVALIDA', fecha_inicio: '2027-12-31', fecha_finalizacion: '2027-01-01' }
        ]) await solicitar('POST', ra, { body, status: 400 });
        const duplicados = await Promise.all([1, 2].map(() =>
            solicitar('POST', ra, { body: { nombre: 'Copa Concurrente 2027' } })));
        assert.deepEqual(duplicados.map(x => x.respuesta.status).sort((x, y) => x - y), [201, 409]);
        const concurrente = duplicados.find(x => x.respuesta.status === 201).datos.edicion;
        await solicitar('DELETE', `${ra}/${concurrente.id}`, { status: 200 });
        t.diagnostic('05. Validaciones, duplicados por colación y creación concurrente.');

        const listadoA = (await solicitar('GET', ra, { status: 200 })).datos;
        assert.equal(listadoA.torneo.id, a);
        assert.equal(listadoA.total, 3);
        assert.deepEqual(listadoA.indicadores, { total: 3, planificadas: 3, en_curso: 0, finalizadas: 0 });
        assert.ok(listadoA.ediciones.every(e => e.torneo_id === a));
        const listadoB = (await solicitar('GET', rb, { status: 200 })).datos;
        assert.equal(listadoB.total, 1);
        assert.equal(listadoB.ediciones[0].id, e3.id);
        const filtrado = (await solicitar('GET', `${ra}?busqueda=${encodeURIComponent('competición')}`, { status: 200 })).datos;
        assert.equal(filtrado.total, 1);
        assert.equal(filtrado.ediciones[0].id, e2.id);
        assert.equal(filtrado.indicadores.total, 3);
        await solicitar('GET', `${ra}?estado=ACTIVA`, { status: 400 });
        await solicitar('GET', '/torneos/0/ediciones', { status: 400 });
        await solicitar('GET', `${ra}/0`, { status: 400 });
        t.diagnostic('06. Listados, búsqueda, filtros e indicadores generales.');

        for (const [method, path, body] of [
            ['GET', `${rb}/${e1.id}`],
            ['PUT', `${rb}/${e1.id}`, { nombre: 'AJENA' }],
            ['PATCH', `${rb}/${e1.id}/estado`, { estado: 'EN_CURSO' }],
            ['DELETE', `${rb}/${e1.id}`]
        ]) await solicitar(method, path, { body, status: 404 });
        assert.equal((await consultar(a, e1.id)).nombre, nombreEdicion);
        t.diagnostic('07. Aislamiento por torneo en todas las operaciones individuales.');

        let editada = (await solicitar('PUT', `${ra}/${e2.id}`, {
            body: { nombre: 'Copa Especial Modificada 2027', fecha_inicio: '2027-02-15' }, status: 200
        })).datos.edicion;
        assert.equal(editada.fecha_inicio, '2027-02-15');
        assert.equal(editada.fecha_finalizacion, '2027-03-01');
        await solicitar('PUT', `${ra}/${e2.id}`, { body: { fecha_finalizacion: '2027-01-01' }, status: 400 });
        await solicitar('PUT', `${ra}/${e2.id}`, { body: { torneo_id: b }, status: 400 });
        editada = (await solicitar('PUT', `${ra}/${e2.id}`, {
            body: { fecha_inicio: null, fecha_finalizacion: '' }, status: 200
        })).datos.edicion;
        assert.equal(editada.fecha_inicio, null);
        assert.equal(editada.fecha_finalizacion, null);
        assert.equal(editada.descripcion, 'Competición de prueba');
        t.diagnostic('08. Edición parcial, fechas modificables y eliminación de fechas.');

        await cambiarEstado(a, e1.id, 'FINALIZADA', 409);
        await cambiarEstado(a, e1.id, 'EN_CURSO');
        await cambiarEstado(a, e1.id, 'EN_CURSO');
        await cambiarEstado(a, e2.id, 'EN_CURSO');
        const enCurso = (await solicitar('GET', `${ra}?estado=EN_CURSO`, { status: 200 })).datos;
        assert.equal(enCurso.total, 2);
        assert.equal(enCurso.indicadores.total, 3);
        assert.equal(enCurso.indicadores.en_curso, 2);
        await cambiarEstado(a, e1.id, 'PLANIFICADA', 409);
        await cambiarEstado(a, e1.id, 'FINALIZADA');
        await cambiarEstado(a, e1.id, 'PLANIFICADA', 409);
        await cambiarEstado(a, e1.id, 'EN_CURSO');
        await cambiarEstado(a, e1.id, 'FINALIZADA');
        const finalizada = await consultar(a, e1.id);
        assert.equal(finalizada.fecha_inicio, null);
        assert.equal(finalizada.fecha_finalizacion, null);
        t.diagnostic('09. Transiciones manuales, idempotencia y ediciones simultáneas.');

        await solicitar('PATCH', `/torneos/${a}/estado`, { body: { estado: 'ARCHIVADO' }, status: 200 });
        assert.equal((await solicitar('GET', ra, { status: 200 })).datos.torneo.estado, 'ARCHIVADO');
        await solicitar('POST', ra, { body: { nombre: 'NO PERMITIDA' }, status: 409 });
        await cambiarEstado(a, e1.id, 'EN_CURSO', 409);
        await cambiarEstado(a, e4.id, 'EN_CURSO', 409);
        await cambiarEstado(a, e2.id, 'FINALIZADA');
        await solicitar('PUT', `${ra}/${e1.id}`, { body: { descripcion: 'Corrección histórica' }, status: 200 });
        await solicitar('DELETE', `${ra}/${e4.id}`, { status: 200 });
        await solicitar('PATCH', `/torneos/${a}/estado`, { body: { estado: 'ACTIVO' }, status: 200 });
        await cambiarEstado(a, e1.id, 'EN_CURSO');
        t.diagnostic('10. Restricciones de archivo y recuperación al reactivar el torneo.');

        const [persistidas] = await pool.execute(
            `SELECT id, torneo_id, nombre, descripcion, estado,
                DATE_FORMAT(fecha_inicio, '%Y-%m-%d') AS fecha_inicio,
                DATE_FORMAT(fecha_finalizacion, '%Y-%m-%d') AS fecha_finalizacion
             FROM ediciones WHERE id IN (?, ?, ?)`, [e1.id, e2.id, e3.id]);
        assert.equal(persistidas.length, 3);
        const p1 = persistidas.find(e => e.id === e1.id);
        const p2 = persistidas.find(e => e.id === e2.id);
        const p3 = persistidas.find(e => e.id === e3.id);
        assert.equal(p1.torneo_id, a);
        assert.equal(p1.estado, 'EN_CURSO');
        assert.equal(p1.descripcion, 'Corrección histórica');
        assert.equal(p2.nombre, 'Copa Especial Modificada 2027');
        assert.equal(p2.estado, 'FINALIZADA');
        assert.equal(p2.fecha_inicio, null);
        assert.equal(p2.fecha_finalizacion, null);
        assert.equal(p3.torneo_id, b);
        assert.equal(p3.fecha_finalizacion, '2027-12-31');
        t.diagnostic('11. Persistencia comprobada mediante consultas SQL reales.');

        // La FK y el CHECK se prueban contra MySQL, sin mocks.
        await assert.rejects(() => pool.execute(
            'DELETE FROM torneos WHERE id = ? AND nombre = ?', [a, nombreA]),
            error => ['ER_ROW_IS_REFERENCED', 'ER_ROW_IS_REFERENCED_2'].includes(error.code));
        await solicitar('DELETE', `/torneos/${a}`, { status: 409 });
        await assert.rejects(() => pool.execute(
            'INSERT INTO ediciones (torneo_id, nombre, fecha_inicio, fecha_finalizacion) VALUES (?, ?, ?, ?)',
            [a, `${prefijo}-CHECK`, '2027-12-31', '2027-01-01']),
            error => error.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || error.errno === 3819);
        await assert.rejects(() => pool.execute(
            'INSERT INTO ediciones (torneo_id, nombre) VALUES (?, ?)', [a, nombreEdicion]),
            error => error.code === 'ER_DUP_ENTRY');
        t.diagnostic('12. Restricciones FK, CHECK y UNIQUE verificadas directamente.');

        await solicitar('DELETE', `${ra}/${e1.id}`, { status: 200 });
        await solicitar('GET', `${ra}/${e1.id}`, { status: 404 });
        await solicitar('DELETE', `${ra}/${e1.id}`, { status: 404 });
        assert.equal((await consultar(b, e3.id)).id, e3.id);
        const reutilizada = await crearEdicion(a, { nombre: nombreEdicion });
        assert.notEqual(reutilizada.id, e1.id);
        await solicitar('DELETE', `${ra}/${reutilizada.id}`, { status: 200 });
        await solicitar('DELETE', `${ra}/${e2.id}`, { status: 200 });
        await solicitar('DELETE', `${rb}/${e3.id}`, { status: 200 });
        const vacio = (await solicitar('GET', ra, { status: 200 })).datos;
        assert.equal(vacio.total, 0);
        assert.deepEqual(vacio.indicadores, { total: 0, planificadas: 0, en_curso: 0, finalizadas: 0 });
        await solicitar('DELETE', `/torneos/${a}`, { status: 200 });
        await solicitar('DELETE', `/torneos/${b}`, { status: 200 });
        await solicitar('GET', ra, { status: 404 });
        t.diagnostic('13. Eliminación, reutilización del nombre y borrado del torneo sin dependencias.');
    } finally {
        try {
            if (aislamientoVerificado) {
                // Limpieza de emergencia: solo registros de los dos torneos UUID de esta ejecución.
                await verificarBase();
                const conexion = await pool.getConnection();
                try {
                    await conexion.beginTransaction();
                    await conexion.execute(
                        'DELETE e FROM ediciones e INNER JOIN torneos t ON t.id = e.torneo_id WHERE t.nombre IN (?, ?)',
                        [nombreA, nombreB]);
                    await conexion.execute('DELETE FROM torneos WHERE nombre IN (?, ?)', [nombreA, nombreB]);
                    await conexion.commit();
                } catch (error) {
                    await conexion.rollback();
                    throw error;
                } finally {
                    conexion.release();
                }
                const [restantes] = await pool.execute(
                    'SELECT COUNT(*) AS total FROM torneos WHERE nombre IN (?, ?)', [nombreA, nombreB]);
                assert.equal(Number(restantes[0].total), 0);
                t.diagnostic('14. Limpieza de registros temporales verificada.');
            }
        } finally {
            try {
                if (cookie) await solicitar('POST', '/auth/logout', { status: 200 });
            } finally {
                await pool.end();
            }
        }
    }
});
