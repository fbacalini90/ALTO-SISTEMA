import { Link } from 'react-router-dom';

import {
    ArrowLeft,
    LayoutGrid
} from 'lucide-react';

import {
    MODULOS
} from '../config/modulos.config';

import {
    ICONOS_MODULOS
} from '../config/iconos.config';

import './ModuloPendiente.css';

/* ==================================================
   ICONOGRAFÍA ESTÁTICA
   ================================================== */

const ICONOS_VISUALES = Object.freeze(
    Object.fromEntries(
        Object.entries(ICONOS_MODULOS).map(
            ([id, Icono]) => [
                id,
                <Icono aria-hidden="true" />
            ]
        )
    )
);

const ICONO_PREDETERMINADO = (
    <LayoutGrid aria-hidden="true" />
);

/* ==================================================
   PANTALLA DE MÓDULOS PENDIENTES
   ================================================== */

export default function ModuloPendiente({
    id,
    titulo,
    descripcion
}) {

    /* IDENTIFICACIÓN DEL MÓDULO */

    const idModulo = id ?? MODULOS.find(
        (modulo) => modulo.titulo === titulo
    )?.id;

    const icono = Object.hasOwn(
        ICONOS_VISUALES,
        idModulo
    )
        ? ICONOS_VISUALES[idModulo]
        : ICONO_PREDETERMINADO;

    /* INTERFAZ */

    return (

        <div className="as-page modulo-pendiente">

            {/* CABECERA DEL MÓDULO */}

            <header className="as-page-header">

                <div>

                    <h1>{titulo.toUpperCase()}</h1>

                    <p>{descripcion}</p>

                </div>

            </header>

            {/* PANEL PROVISIONAL */}

            <section
                className="as-panel modulo-panel"
                aria-labelledby="modulo-pendiente-titulo"
            >

                <div className="modulo-icono">

                    {icono}

                </div>

                <span className="as-status as-status-pending">

                    PENDIENTE DE IMPLEMENTACIÓN

                </span>

                <h2 id="modulo-pendiente-titulo">

                    {titulo}

                </h2>

                <p className="as-text-description">

                    Las funcionalidades de este módulo serán
                    incorporadas en una próxima etapa del
                    desarrollo de ALTO-SISTEMA.

                </p>

                <Link
                    to="/"
                    className="as-button as-button-primary modulo-volver"
                >

                    <ArrowLeft aria-hidden="true" />

                    VOLVER AL INICIO

                </Link>

            </section>

        </div>

    );

}