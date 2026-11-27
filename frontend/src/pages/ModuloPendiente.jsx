import { Link } from 'react-router-dom';
import './ModuloPendiente.css';

function ModuloPendiente({ titulo, descripcion, icono }) {
  return (
    <div className="modulo-pendiente">

      <header className="modulo-cabecera">
        <h2>{titulo.toUpperCase()}</h2>
        <p>{descripcion}</p>
      </header>

      <section className="modulo-panel">

        <span
          className="modulo-icono"
          aria-hidden="true"
        >
          {icono}
        </span>

        <span className="modulo-etiqueta">
          PENDIENTE DE IMPLEMENTACIÓN
        </span>

        <h3>{titulo}</h3>

        <p>
          Las funcionalidades de este módulo serán
          incorporadas en una próxima etapa del
          desarrollo de ALTO-SISTEMA.
        </p>

        <Link
          to="/"
          className="modulo-volver"
        >
          ← VOLVER AL INICIO
        </Link>

      </section>

    </div>
  );
}

export default ModuloPendiente;