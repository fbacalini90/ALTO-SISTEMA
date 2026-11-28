const torneoService =
    require('../services/torneo.service');

/* MANEJO DE ERRORES */

function responderError(res, error) {
    if (error instanceof torneoService.TorneoError) {
        return res.status(error.status).json({
            mensaje: error.message
        });
    }

    console.error(
        'Error interno en el módulo de torneos:',
        error
    );

    return res.status(500).json({
        mensaje: 'Ocurrió un error interno en el módulo de torneos.'
    });
}

/* LISTAR TORNEOS */

async function listar(req, res) {
    try {
        const torneos =
            await torneoService.listarTorneos(
                req.query
            );

        return res.status(200).json({
            torneos,
            total: torneos.length
        });

    } catch (error) {
        return responderError(res, error);
    }
}

/* OBTENER TORNEO POR ID */

async function obtener(req, res) {
    try {
        const torneo =
            await torneoService.obtenerTorneo(
                req.params.id
            );

        return res.status(200).json({
            torneo
        });

    } catch (error) {
        return responderError(res, error);
    }
}

/* CREAR TORNEO */

async function crear(req, res) {
    try {
        const torneo =
            await torneoService.crearTorneo(
                req.body
            );

        return res
            .location(`/api/torneos/${torneo.id}`)
            .status(201)
            .json({
                mensaje: 'Torneo creado correctamente.',
                torneo
            });

    } catch (error) {
        return responderError(res, error);
    }
}

/* ACTUALIZAR TORNEO */

async function actualizar(req, res) {
    try {
        const torneo =
            await torneoService.actualizarTorneo(
                req.params.id,
                req.body
            );

        return res.status(200).json({
            mensaje: 'Torneo actualizado correctamente.',
            torneo
        });

    } catch (error) {
        return responderError(res, error);
    }
}

/* ARCHIVAR O REACTIVAR TORNEO */

async function cambiarEstado(req, res) {
    try {
        const torneo =
            await torneoService.cambiarEstadoTorneo(
                req.params.id,
                req.body
            );

        const mensaje =
            torneo.estado ===
                torneoService.ESTADOS_TORNEO.ARCHIVADO
                ? 'Torneo archivado correctamente.'
                : 'Torneo reactivado correctamente.';

        return res.status(200).json({
            mensaje,
            torneo
        });

    } catch (error) {
        return responderError(res, error);
    }
}

/* ELIMINAR TORNEO */

async function eliminar(req, res) {
    try {
        await torneoService.eliminarTorneo(req.params.id);

        return res.status(200).json({
            mensaje: 'Torneo eliminado correctamente.'
        });

    } catch (error) {
        return responderError(res, error);
    }
}

/* EXPORTACIONES */

module.exports = {
    listar,
    obtener,
    crear,
    actualizar,
    cambiarEstado,
    eliminar
};
