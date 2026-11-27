import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/api/health')
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error('Error de conexion');
        }

        return respuesta.json();
      })
      .then((datos) => {
        setEstado(datos);
        setError(false);
      })
      .catch(() => {
        setError(true);
      });
  }, []);

  return (
    <main className="contenedor">
      <h1>ALTO-SISTEMA</h1>

      <h2>Gestion de torneos amateurs</h2>

      <p>Version 0.1.0 - Infraestructura</p>

      <section className="estado">
        <h3>Estado del sistema</h3>

        <p>Frontend: ONLINE</p>

        <p>
          Backend: {
            error ? 'OFFLINE' :
            estado ? estado.backend : 'CONECTANDO...'
          }
        </p>

        <p>
          Base de datos: {
            error ? 'NO DISPONIBLE' :
            estado ? estado.database : 'CONECTANDO...'
          }
        </p>
      </section>
    </main>
  );
}

export default App;