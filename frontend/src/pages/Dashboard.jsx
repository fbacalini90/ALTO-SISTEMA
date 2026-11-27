import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { APP_CONFIG } from '../config/app.config';
import { ACCESOS_RAPIDOS } from '../config/modulos.config';
import { api, ApiError } from '../services/api';

import './Dashboard.css';

function Dashboard() {
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function verificarEstado() {
      try {
        const datos = await api.get('/health', {
          signal: controller.signal
        });

        if (!controller.signal.aborted) {
          setEstado(datos);
        }

      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (
          error instanceof ApiError &&
          error.status === 503 &&
          error.datos?.backend === 'ONLINE'
        ) {
          setEstado(error.datos);
        } else {
          setEstado({
            backend: 'NO DISPONIBLE',
            database: 'NO VERIFICADA'
          });
        }
      }
    }

    verificarEstado();

    return () => controller.abort();
  }, []);

  const fechaActual = new Intl.DateTimeFormat(
    APP_CONFIG.idioma,
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: APP_CONFIG.zonaHoraria
    }
  ).format(new Date());

  const indicadores = [
    {
      nombre: 'Frontend',
      valor: 'ONLINE'
    },
    {
      nombre: 'Backend',
      valor: estado?.backend || 'VERIFICANDO'
    },
    {
      nombre: 'Base de datos',
      valor: estado?.database || 'VERIFICANDO'
    }
  ];

  return (
    <div className="dashboard">

      <header className="dashboard-cabecera">
        <div>
          <h2>PANEL PRINCIPAL</h2>
          <p>{APP_CONFIG.descripcion}</p>
        </div>

        <span className="dashboard-fecha">
          {fechaActual}
        </span>
      </header>

      <section className="dashboard-bienvenida">
        <div>
          <span className="dashboard-etiqueta">
            GESTIÓN DE TORNEOS AMATEURS
          </span>

          <h3>Bienvenido a {APP_CONFIG.nombre}</h3>

          <p>
            Administrá tus torneos, registrá los partidos
            y generá tus publicaciones desde un mismo lugar.
          </p>
        </div>

        <span
          className="dashboard-bienvenida-icono"
          aria-hidden="true"
        >
          ⚽
        </span>
      </section>

      <section className="dashboard-seccion">

        <h3>ACCESOS RÁPIDOS</h3>

        <div className="dashboard-accesos">

          {ACCESOS_RAPIDOS.map((acceso) => (
            <Link
              key={acceso.id}
              to={acceso.ruta}
              className="dashboard-acceso"
            >
              <span
                className="dashboard-acceso-icono"
                aria-hidden="true"
              >
                {acceso.icono}
              </span>

              <h4>{acceso.titulo}</h4>

              <p>
                {acceso.descripcionRapida || acceso.descripcion}
              </p>

              <span className="dashboard-acceso-accion">
                INGRESAR →
              </span>
            </Link>
          ))}

        </div>

      </section>

      <section className="dashboard-seccion">

        <h3>RESUMEN DE ACTIVIDAD</h3>

        <div className="dashboard-resumen">

          <article className="dashboard-indicador">
            <span>Torneos activos</span>
            <strong>—</strong>
            <small>Pendiente de implementación</small>
          </article>

          <article className="dashboard-indicador">
            <span>Equipos inscritos</span>
            <strong>—</strong>
            <small>Pendiente de implementación</small>
          </article>

          <article className="dashboard-indicador">
            <span>Partidos disputados</span>
            <strong>—</strong>
            <small>Pendiente de implementación</small>
          </article>

          <article className="dashboard-indicador">
            <span>Goles convertidos</span>
            <strong>—</strong>
            <small>Pendiente de implementación</small>
          </article>

        </div>

      </section>

      <section className="dashboard-seccion">

        <h3>ESTADO DEL SISTEMA</h3>

        <div className="dashboard-sistema">

          {indicadores.map((indicador) => (
            <div
              key={indicador.nombre}
              className="dashboard-servicio"
            >
              <span>{indicador.nombre}</span>

              <span
                className={
                  `dashboard-estado ${
                    indicador.valor === 'ONLINE'
                      ? 'dashboard-online'
                      : indicador.valor === 'VERIFICANDO'
                        ? 'dashboard-verificando'
                        : 'dashboard-offline'
                  }`
                }
              >
                ● {indicador.valor}
              </span>
            </div>
          ))}

        </div>

      </section>

    </div>
  );
}

export default Dashboard;