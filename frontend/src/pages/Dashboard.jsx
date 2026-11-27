import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const accesos = [
  {
    titulo: 'Torneos',
    descripcion: 'Gestión de ediciones y categorías.',
    icono: '🏆',
    ruta: '/torneos'
  },
  {
    titulo: 'Equipos',
    descripcion: 'Inscripciones y participantes.',
    icono: '🛡',
    ruta: '/equipos'
  },
  {
    titulo: 'Partidos',
    descripcion: 'Carga de resultados en vivo.',
    icono: '⚽',
    ruta: '/partidos'
  },
  {
    titulo: 'Publicaciones',
    descripcion: 'Generación de placas para WhatsApp.',
    icono: '🖼',
    ruta: '/publicaciones'
  }
];

function Dashboard() {
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function verificarEstado() {
      try {
        const respuesta = await fetch(
          'http://localhost:3000/api/health',
          {
            credentials: 'include',
            signal: controller.signal
          }
        );

        const datos = await respuesta.json();

        if (!controller.signal.aborted) {
          setEstado(datos);
        }
      } catch {
        if (!controller.signal.aborted) {
          setEstado({
            backend: 'OFFLINE',
            database: 'NO DISPONIBLE'
          });
        }
      }
    }

    verificarEstado();

    return () => controller.abort();
  }, []);

  const fechaActual = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

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
          <p>Sistema integral de gestión deportiva</p>
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

          <h3>Bienvenido a ALTO-SISTEMA</h3>

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

          {accesos.map((acceso) => (
            <Link
              key={acceso.ruta}
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

              <p>{acceso.descripcion}</p>

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