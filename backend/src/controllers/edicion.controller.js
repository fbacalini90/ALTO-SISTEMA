
const edicionService =
    require('../services/edicion.service');

const { EdicionError } = edicionService;


/* GESTION CENTRALIZADA DE ERRORES */

function responderError(res, error) {
    if (error instanceof EdicionError) {
        return res
            .status(error.status)
            .json({
                mensaje: error.message
            });
    }

    console.error(
        'Error interno en el módulo de ediciones:',
        error
    );

    return res
        .status(500)
        .json({
            mensaje:
                'Ocurrió un error interno al gestionar las ediciones.'
        });
}


/* LISTADO DE EDICIONES */

async function listarEdiciones(req, res) {
    try {
        const { torneoId } = req.params;

        const resultado =
            await edicionService.listarEdiciones(
                torneoId,
                req.query
            );

        return res
            .status(200)
            .json(resultado);

    } catch (error) {
        return responderError(
            res,
            error
        );
    }
}


/* CONSULTA INDIVIDUAL */

async function obtenerEdicion(req, res) {
    try {
        const {
            torneoId,
            edicionId
        } = req.params;

        const edicion =
            await edicionService.obtenerEdicion(
                torneoId,
                edicionId
            );

        return res
            .status(200)
            .json({
                edicion
            });

    } catch (error) {
        return responderError(
            res,
            error
        );
    }
}


/* CREACION DE EDICIONES */

async function crearEdicion(req, res) {
    try {
        const { torneoId } = req.params;

        const edicion =
            await edicionService.crearEdicion(
                torneoId,
                req.body
            );

        const ubicacion =
            `/api/torneos/${edicion.torneo_id}` +
            `/ediciones/${edicion.id}`;

        return res
            .location(ubicacion)
            .status(201)
            .json({
                mensaje:
                    'Edición creada correctamente.',

                edicion
            });

    } catch (error) {
        return responderError(
            res,
            error
        );
    }
}


/* ACTUALIZACION DE EDICIONES */

async function actualizarEdicion(req, res) {
    try {
        const {
            torneoId,
            edicionId
        } = req.params;

        const edicion =
            await edicionService.actualizarEdicion(
                torneoId,
                edicionId,
                req.body
            );

        return res
            .status(200)
            .json({
                mensaje:
                    'Edición actualizada correctamente.',

                edicion
            });

    } catch (error) {
        return responderError(
            res,
            error
        );
    }
}


/* CAMBIO DE ESTADO */

async function cambiarEstadoEdicion(req, res) {
    try {
        const {
            torneoId,
            edicionId
        } = req.params;

        const edicion =
            await edicionService.cambiarEstadoEdicion(
                torneoId,
                edicionId,
                req.body
            );

        return res
            .status(200)
            .json({
                mensaje:
                    'Estado de la edición actualizado correctamente.',

                edicion
            });

    } catch (error) {
        return responderError(
            res,
            error
        );
    }
}


/* ELIMINACION DEFINITIVA */

async function eliminarEdicion(req, res) {
    try {
        const {
            torneoId,
            edicionId
        } = req.params;

        await edicionService.eliminarEdicion(
            torneoId,
            edicionId
        );

        return res
            .status(200)
            .json({
                mensaje:
                    'Edición eliminada correctamente.'
            });

    } catch (error) {
        return responderError(
            res,
            error
        );
    }
}


/* EXPORTACIONES */

module.exports = {
    listarEdiciones,
    obtenerEdicion,
    crearEdicion,
    actualizarEdicion,
    cambiarEstadoEdicion,
    eliminarEdicion
};
