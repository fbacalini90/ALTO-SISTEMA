# ALTO-SISTEMA — Normas de desarrollo

Version de referencia: 0.1.3

## 1. Objetivo

Garantizar que ALTO-SISTEMA evolucione de manera
ordenada, mantenible, escalable y segura.

Estas normas deberan respetarse durante todo
el ciclo de vida del proyecto.

## 2. Metodologia de trabajo

El desarrollo se organizara mediante:

- Etapas.
- Historias de usuario.
- Criterios de aceptacion.
- Incrementos funcionales.
- Pruebas automatizadas.
- CHECK integral.
- Control de versiones.

Cada historia de usuario debera completarse
y aprobarse antes de comenzar la siguiente.

No se considerara terminada una funcionalidad
unicamente porque su codigo haya sido escrito.

## 3. Puerta de control

Cada incremento debera atravesar las siguientes fases:

1. Definicion de requisitos.
2. Diseño tecnico.
3. Implementacion.
4. Pruebas automatizadas.
5. Pruebas funcionales.
6. CHECK integral.
7. Aprobacion.
8. Commit en Git.

Si una prueba falla, debera corregirse el problema
antes de aprobar el incremento.

No se avanzara hacia una nueva historia de usuario
con errores pendientes que afecten los criterios
de aceptacion de la historia actual.

## 4. Entrega de codigo

Cada archivo creado o modificado debera entregarse
con su contenido completo.

Se debera indicar:

- Ruta exacta del archivo.
- Nombre del archivo.
- Responsabilidad del componente.
- Cambios incorporados.
- Dependencias necesarias.
- Procedimiento de verificacion.

No se utilizaran fragmentos aislados que puedan
generar errores de integracion.

Las instrucciones deberan distinguir claramente
entre operaciones del editor y de la terminal.

## 5. Principios de programacion

Se adoptan los siguientes principios:

- SOLID.
- DRY.
- KISS.
- Separacion de responsabilidades.
- Bajo acoplamiento.
- Alta cohesion.
- Reutilizacion de componentes.
- Validacion de datos.
- Manejo controlado de errores.

Se evitara incorporar complejidad innecesaria.

Las abstracciones deberan responder a necesidades
reales del sistema.

## 6. Convenciones de nombres

### Backend

Archivos:

- torneo.routes.js
- torneo.controller.js
- torneo.service.js
- torneo.repository.js

Funciones y variables:

- camelCase.

Clases:

- PascalCase.

Constantes:

- MAYUSCULAS_CON_GUIONES_BAJOS.

### Frontend

Componentes React:

- PascalCase.

Ejemplos:

- Torneos.jsx
- Torneos.css
- AppLayout.jsx

Funciones y variables:

- camelCase.

Archivos de configuracion:

- app.config.js
- modulos.config.js

### Base de datos

Tablas y columnas:

- snake_case.
- Minusculas.
- Sin espacios.
- Sin caracteres especiales.

Ejemplos:

- torneos
- ediciones
- equipos_inscritos
- fecha_creacion
- torneo_id

## 7. Idioma

El idioma principal del proyecto sera español.

Las entidades deportivas, funciones de negocio
y mensajes de interfaz utilizaran terminologia
coherente con el dominio del futbol amateur.

Se conservaran los nombres originales de las
tecnologias, librerias y convenciones tecnicas.

Los archivos de codigo deberan utilizar UTF-8.

## 8. Normas del frontend

- Utilizar componentes reutilizables.
- Centralizar la configuracion.
- Centralizar las comunicaciones HTTP.
- Evitar definiciones duplicadas de navegacion.
- Mantener una interfaz responsive.
- Gestionar estados de carga y error.
- Mostrar mensajes comprensibles.
- Evitar estadisticas ficticias.
- Mantener visible el contexto deportivo.
- Solicitar confirmacion para acciones destructivas.

Las validaciones del frontend mejoran la experiencia
de uso, pero no sustituyen las del backend.

## 9. Normas del backend

Las responsabilidades deberan separarse entre:

- Rutas.
- Controladores.
- Servicios.
- Repositorios.
- Middlewares.

Las reglas deportivas deberan implementarse
en los servicios correspondientes.

Las consultas SQL deberan implementarse
en repositorios.

Las rutas privadas deberan verificar
la autenticacion del usuario.

Los datos recibidos deberan validarse
antes de realizar operaciones de escritura.

Los errores internos no deberan exponer
informacion sensible al cliente.

## 10. Normas de la API REST

Se utilizaran los metodos HTTP segun corresponda:

- GET: consultar recursos.
- POST: crear recursos o ejecutar acciones.
- PUT: reemplazar recursos.
- PATCH: actualizar parcialmente recursos.
- DELETE: eliminar recursos cuando corresponda.

Codigos HTTP de referencia:

- 200: operacion correcta.
- 201: recurso creado.
- 204: operacion correcta sin contenido.
- 400: solicitud invalida.
- 401: autenticacion requerida.
- 403: operacion no autorizada.
- 404: recurso inexistente.
- 409: conflicto de datos.
- 500: error interno.
- 503: servicio no disponible.

Los endpoints deberan mantener respuestas
consistentes y documentadas.

Los cambios incompatibles deberan planificarse
para evitar romper funcionalidades existentes.

## 11. Normas de persistencia

- Utilizar MySQL como fuente de verdad.
- Utilizar consultas parametrizadas.
- Definir claves primarias y foraneas.
- Establecer restricciones de unicidad.
- Incorporar indices segun necesidades reales.
- Utilizar transacciones para operaciones relacionadas.
- Aplicar migraciones versionadas.
- Preservar la integridad referencial.
- Conservar el historial deportivo.

No se deberan modificar manualmente las estructuras
de una base de datos operativa sin registrar
el cambio mediante una migracion.

## 12. Arquitectura multitorneo

Toda funcionalidad deportiva debera respetar
el contexto de torneo, edicion y categoria.

Las relaciones entre entidades deberan validarse
antes de consultar o modificar informacion.

No se permitira mezclar resultados, equipos
o estadisticas de diferentes competiciones.

No se utilizaran nombres de torneos o categorias
como condiciones fijas de la logica de negocio.

Las excepciones reglamentarias deberan estar
expresamente definidas y documentadas.

## 13. Seguridad

- No almacenar contraseñas en texto plano.
- No versionar archivos .env.
- No versionar respaldos con datos sensibles.
- No exponer hashes de contraseñas.
- No registrar contraseñas en logs.
- Validar las solicitudes del cliente.
- Utilizar consultas SQL parametrizadas.
- Mantener las dependencias actualizadas.
- Revisar vulnerabilidades.
- Aplicar el principio de minimo privilegio.

Los datos personales de las listas de buena fe
no deberan incluirse en publicaciones deportivas.

Las credenciales utilizadas durante el desarrollo
deberan rotarse antes del despliegue en produccion.

## 14. Dependencias

Antes de incorporar una dependencia se evaluara:

- Necesidad real.
- Seguridad.
- Compatibilidad.
- Mantenimiento.
- Rendimiento.
- Licencia.
- Costos asociados.

Se priorizaran las capacidades nativas de las
tecnologias existentes cuando sean suficientes.

Los archivos package-lock.json deberan
mantenerse versionados mediante Git.

No se actualizaran dependencias de forma masiva
sin evaluar posibles regresiones.

## 15. Pruebas

Cada nueva funcionalidad debera incorporar
pruebas acordes a su complejidad.

Tipos de pruebas:

- Unitarias.
- Integracion.
- Funcionales.
- Regresion.
- Integridad de datos.
- Rendimiento, cuando corresponda.

Las pruebas automatizadas deberan utilizar
datos ficticios o entornos controlados.

Las pruebas de integracion sobre el entorno local
deberan evitar modificaciones destructivas.

Se deberan incorporar pruebas especificas
para detectar contaminacion de datos entre torneos.

## 16. Control de versiones

Git sera el sistema de control de versiones.

Cada incremento aprobado debera generar
un commit identificable.

Ejemplos:

HU-001 - Infraestructura funcional v0.1.0

HU-002 - Autenticacion y acceso privado v0.1.1

HU-003 - Interfaz base y navegacion v0.1.2

No se deberan incorporar:

- node_modules.
- Credenciales.
- Archivos .env.
- Respaldos sensibles.
- Archivos temporales.
- Registros innecesarios.

Antes de cada commit se debera revisar git status
y comprobar los archivos preparados.

## 17. Versionado

Se utilizara una numeracion con formato:

MAYOR.MENOR.PARCHE

MAYOR:
Cambios incompatibles o transformaciones
estructurales de gran alcance.

MENOR:
Incorporacion de nuevas funcionalidades
compatibles.

PARCHE:
Correcciones y mejoras compatibles.

Durante la fase 0.x.x, la numeracion tambien
identificara los incrementos de desarrollo.

La version 1.0.0 representara la primera version
estable destinada a la operacion real, una vez
cumplidos sus criterios de aceptacion.

## 18. Documentacion

Las decisiones tecnicas relevantes deberan
documentarse dentro del repositorio.

La documentacion debera actualizarse cuando cambien:

- Arquitectura.
- Modelo de datos.
- Reglas deportivas.
- Endpoints.
- Dependencias.
- Procedimientos de mantenimiento.
- Requisitos de despliegue.

Se debera distinguir entre funcionalidades
implementadas, verificadas y planificadas.

## 19. Rendimiento

Las optimizaciones deberan basarse en mediciones.

Se evitara:

- Consultas SQL innecesarias.
- Consultas repetidas dentro de bucles.
- Carga indiscriminada de registros.
- Recalculos deportivos innecesarios.
- Renderizados redundantes.
- Dependencias sobredimensionadas.

La paginacion, los indices y otras estrategias
de optimizacion se incorporaran cuando corresponda.

## 20. Sostenibilidad economica

Se priorizara una infraestructura de bajo costo
adecuada al volumen operativo del sistema.

No se incorporaran servicios pagos sin evaluar
su necesidad y contar con autorizacion.

Los limites y condiciones de los servicios
gratuitos deberan verificarse antes del despliegue.

## 21. Criterio de finalizacion

Una historia de usuario se considerara finalizada
cuando:

- Cumpla sus requisitos funcionales.
- Respete la arquitectura.
- Supere sus criterios de aceptacion.
- Supere las pruebas correspondientes.
- No presente regresiones conocidas bloqueantes.
- Disponga de documentacion actualizada.
- Reciba la aprobacion del CHECK integral.
- Quede versionada mediante Git.

La calidad del sistema constituye un requisito
permanente y no una etapa opcional.