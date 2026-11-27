# ALTO-SISTEMA — Arquitectura

Version de referencia: 0.1.3

## 1. Objetivo

Desarrollar un sistema integral de gestion de torneos
de futbol amateur, mantenible, escalable, seguro,
modular y economicamente sostenible.

El sistema debe permitir administrar multiples torneos
simultaneos, incluyendo el Nocturno y el Diurno,
sin mezclar sus datos deportivos.

## 2. Arquitectura general

ALTO-SISTEMA adopta una arquitectura de tres capas
mediante un monolito modular.

### Presentacion

- React.
- Vite.
- JavaScript.
- React Router.
- CSS responsive.

### Logica de negocio

- Node.js.
- Express.
- API REST.
- Comunicaciones JSON.

### Persistencia

- MySQL 8.
- Motor InnoDB.
- Codificacion utf8mb4.
- Consultas SQL parametrizadas.
- Pool de conexiones.
- Migraciones versionadas.

## 3. Arquitectura del frontend

frontend/src/
    assets/
    config/
    layouts/
    pages/
    services/
    App.jsx
    App.css
    index.css
    main.jsx

### Responsabilidades

- assets: recursos visuales.
- config: configuracion y definicion de modulos.
- layouts: estructuras visuales reutilizables.
- pages: pantallas de la aplicacion.
- services: comunicaciones con el backend.
- App.jsx: enrutamiento y estado de autenticacion.

Los componentes no deben realizar solicitudes HTTP
directas cuando exista un servicio centralizado.

La navegacion debe utilizar una unica definicion
de modulos.

## 4. Arquitectura del backend

backend/src/
    config/
    controllers/
    middlewares/
    repositories/
    routes/
    services/
    create-admin.js
    migrate.js
    server.js

backend/tests/

### Responsabilidades

- config: configuracion e infraestructura.
- routes: definicion de endpoints HTTP.
- controllers: solicitudes y respuestas HTTP.
- services: validaciones y logica de negocio.
- repositories: acceso a la base de datos.
- middlewares: autenticacion y controles transversales.
- tests: pruebas automatizadas.
- server.js: inicializacion del servidor.
- migrate.js: ejecucion de migraciones.
- create-admin.js: creacion inicial del administrador.

## 5. Flujo de una solicitud

Frontend
    -> Servicio API
    -> Ruta
    -> Middlewares correspondientes
    -> Controlador
    -> Servicio de negocio
    -> Repositorio
    -> MySQL

La respuesta retorna al frontend mediante la API.

Las reglas deportivas deben implementarse en los
servicios de negocio.

Los controladores no deben contener consultas SQL.

Los repositorios no deben depender de Express ni
gestionar respuestas HTTP.

## 6. Seguridad

Implementado:

- Acceso privado mediante autenticacion.
- Hash de contraseñas mediante bcrypt.
- Sesiones persistentes en MySQL.
- Regeneracion de sesion al autenticar.
- Cookies HttpOnly.
- Cookies SameSite=Lax.
- Proteccion de origen en solicitudes de escritura.
- Configuracion CORS.
- Consultas SQL parametrizadas.
- Limitacion de intentos de inicio de sesion.
- Credenciales mediante variables de entorno.
- Exclusiones de archivos sensibles en Git.

Pendiente para el despliegue:

- HTTPS.
- Configuracion segura del entorno de produccion.
- Revision de cookies y dominios.
- Rotacion de credenciales.
- Politica de respaldos periodicos.
- Revision del limitador de solicitudes.
- Gestion de expiracion de sesion en el frontend.

## 7. Persistencia

MySQL constituye la fuente de verdad de los datos.

Las modificaciones estructurales deben realizarse
mediante migraciones SQL versionadas.

Las operaciones deportivas que involucren multiples
escrituras relacionadas deberan utilizar transacciones.

Las relaciones, restricciones e indices deberan
garantizar la integridad de los datos.

No se deben eliminar datos historicos sin una
politica de conservacion previamente definida.

## 8. Arquitectura multitorneo

La aplicacion debe contemplar la siguiente jerarquia:

    Torneo
        Edicion
            Categoria
                Fases
                Zonas
                Equipos inscritos
                Jornadas
                Partidos
                Copas
                Estadisticas

Los datos deportivos deben quedar vinculados
al contexto correspondiente.

La separacion debe garantizarse tanto en el frontend
como en el backend y en la base de datos.

No deben existir nombres de torneos, categorias,
cantidades de equipos o formatos de competicion
fijados directamente en el codigo de negocio.

Las reglas transversales, como las sanciones entre
categorias o torneos, deberan definirse expresamente.

El modelo deportivo aun no esta implementado
en la version 0.1.3.

## 9. Principios de desarrollo

- SOLID.
- DRY.
- KISS.
- Separacion de responsabilidades.
- Bajo acoplamiento.
- Alta cohesion.
- Reutilizacion de componentes.
- Normalizacion de datos.
- Validaciones del lado del servidor.
- Control de versiones mediante Git.
- Pruebas automatizadas.
- Documentacion versionada.

## 10. Escalabilidad

El sistema debe permitir:

- Multiples torneos simultaneos.
- Multiples ediciones.
- Nuevas categorias.
- Nuevos formatos de competicion.
- Reglamentos configurables.
- Identidad visual configurable.
- Conservacion del historial deportivo.
- Incorporacion de nuevas funcionalidades.

Se prioriza el monolito modular frente a arquitecturas
distribuidas innecesariamente complejas.

Las futuras decisiones de rendimiento deberan
basarse en mediciones y necesidades reales.

## 11. Calidad y pruebas

Estado comprobado durante el desarrollo de v0.1.3:

- 13 pruebas unitarias de autenticacion aprobadas.
- 1 prueba de integracion aprobada.
- Primera migracion SQL aplicada correctamente.
- Idempotencia del migrador comprobada.
- Restauracion de respaldo MySQL comprobada.
- Coincidencia del administrador restaurado verificada.
- 0 vulnerabilidades reportadas en la ultima
  auditoria npm del backend.

Pendiente:

- CHECK integral de regresion de v0.1.3.
- Pruebas automatizadas del frontend.
- Pruebas de las futuras reglas deportivas.
- Pruebas de rendimiento y carga.
- Validacion en dispositivos moviles fisicos.
- Despliegue en produccion.

## 12. Control arquitectonico

Cada nueva historia de usuario debe respetar
la arquitectura definida en este documento.

Toda modificacion arquitectonica significativa
debera documentarse y versionarse mediante Git.

La escalabilidad funcional es un requisito de diseño.
La capacidad de carga debera verificarse mediante
pruebas cuando exista suficiente funcionalidad.

Este documento debe evolucionar junto con el sistema.