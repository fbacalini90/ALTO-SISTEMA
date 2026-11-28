# ALTO-SISTEMA — Normas de desarrollo

Versión de referencia: 0.3.0

Estado: HU-005 implementada y verificada;
consolidación documental, CHECK integral
y publicación pendientes.

---

## 1. OBJETIVO

Establecer una metodología de desarrollo que permita
evolucionar ALTO-SISTEMA de manera organizada,
segura, mantenible y escalable.

Las presentes normas serán aplicables durante
todo el ciclo de vida del proyecto.

La calidad técnica deberá mantenerse desde
las primeras etapas de implementación.

---

## 2. METODOLOGÍA DE TRABAJO

El proyecto se desarrollará mediante incrementos
funcionales organizados en etapas e historias
de usuario.

Cada historia de usuario deberá contar con:

- Identificador.
- Objetivo funcional.
- Alcance definido.
- Requisitos.
- Criterios de aceptación.
- Diseño técnico.
- Implementación.
- Pruebas.
- Documentación.
- CHECK integral.

Las historias de usuario deberán desarrollarse
de manera secuencial.

No se comenzará una nueva historia de usuario
hasta aprobar y consolidar la anterior.

### 2.1. Unidad de trabajo

La unidad funcional de desarrollo será
la historia de usuario completa.

Los pasos técnicos permitirán organizar
su implementación, pero no constituirán
historias de usuario independientes.

Se evitará fragmentar innecesariamente
el proceso de validación.

### 2.2. Alcance

Las funcionalidades deberán corresponder
al alcance previamente aprobado.

Las modificaciones que amplíen dicho alcance
deberán evaluarse antes de implementarse.

Los cambios complementarios deberán quedar
identificados y documentados.

### 2.3. Ampliaciones durante la validación

Una historia de usuario podrá incorporar
funcionalidades adicionales antes de su
aprobación definitiva.

Toda ampliación deberá contemplar:

- Aprobación funcional.
- Evaluación del impacto técnico.
- Nuevos criterios de aceptación.
- Actualización de pruebas.
- Regresión de funcionalidades existentes.
- Actualización de documentación.

La ampliación no deberá considerarse aprobada
hasta completar el CHECK integral correspondiente.

Durante HU-004 se incorporó la eliminación
definitiva de torneos mediante este procedimiento.

---

## 3. PUERTA DE CONTROL

Cada incremento atravesará las siguientes fases:

1. Definición funcional.
2. Aprobación del alcance.
3. Diseño técnico.
4. Implementación.
5. Pruebas automatizadas.
6. Verificación funcional.
7. Actualización de documentación.
8. CHECK integral.
9. Aprobación.
10. Consolidación mediante Git.

### 3.1. CHECK integral

Cada historia de usuario dispondrá de un
CHECK integral que abarque todos sus
criterios de aceptación.

Los controles técnicos intermedios no
sustituyen esta instancia.

El CHECK deberá contemplar:

- Requisitos funcionales.
- Validaciones.
- Persistencia.
- Integridad de datos.
- Seguridad.
- Interfaz.
- Adaptación responsive.
- Pruebas automatizadas.
- Regresión de funcionalidades anteriores.
- Documentación.

### 3.2. Gestión de errores

Cuando se detecte un error bloqueante:

- Se interrumpirá el avance.
- Se identificará su origen.
- Se determinará su alcance.
- Se implementará la corrección.
- Se repetirán las pruebas afectadas.

No se aprobará una historia de usuario
mientras existan errores que impidan
satisfacer sus criterios de aceptación.

Los posibles errores deberán comprobarse
antes de modificar el código fuente.

### 3.3. Estados de implementación

| Estado | Significado |
|---|---|
| Pendiente | Sin implementación |
| En desarrollo | Implementación en curso |
| Implementado | Código incorporado |
| Verificado | Pruebas correspondientes realizadas |
| Aprobado | CHECK integral satisfactorio |
| Consolidado | Cambios registrados en Git |

La existencia de código no implica
automáticamente su aprobación.

---

## 4. ENTREGA DE ARCHIVOS E INSTRUCCIONES

### 4.1. Archivos completos

Los archivos nuevos o modificados deberán
entregarse con su contenido completo.

No se utilizarán fragmentos aislados que
puedan provocar errores de integración.

Cada entrega deberá indicar:

- Ruta exacta.
- Nombre del archivo.
- Responsabilidad.
- Cambios incorporados.
- Dependencias, cuando corresponda.
- Procedimiento de implementación.

### 4.2. Editor de código

Las operaciones de creación y modificación
de código fuente se realizarán mediante
el editor de VS Code.

Esto comprende:

- Archivos JavaScript.
- Componentes JSX.
- Estilos CSS.
- Configuraciones.
- Migraciones SQL.
- Archivos Markdown.

La documentación deberá actualizarse
directamente desde el editor.

No se utilizarán scripts de terminal para
reescribir documentos Markdown cuando
puedan editarse directamente.

### 4.3. Terminal

La terminal se utilizará principalmente para:

- Instalación de dependencias.
- Ejecución de servidores.
- Compilación.
- Análisis estático.
- Pruebas automatizadas.
- Ejecución de migraciones.
- Operaciones de base de datos.
- Respaldos y restauraciones.
- Actualización de versiones de paquetes.
- Control de versiones mediante Git.

Las instrucciones deberán identificar
la terminal y el directorio de trabajo.

### 4.4. Operaciones controladas

Las operaciones que puedan modificar
información persistente deberán indicar
su alcance y sus posibles consecuencias.

Se evitarán instrucciones innecesariamente
complejas cuando exista una alternativa
directa, comprensible y segura.

### 4.5. Actualizaciones mediante paquetes ZIP

Los archivos descargables se entregarán
mediante paquetes ZIP, incluso cuando
la entrega corresponda a un único archivo,
para evitar problemas de descarga directa.

Se mantendrá un archivo o paso operativo
por vez, salvo operaciones que requieran
actualizar archivos relacionados de forma
conjunta, como package.json y package-lock.json.

El paquete deberá:

- Respetar la estructura del proyecto.
- Contener únicamente los archivos necesarios.
- Verificar la integridad del paquete y sus archivos.
- Indicar el destino exacto de extracción.
- Identificar los cambios incorporados.
- Excluir credenciales y configuraciones privadas.
- Excluir dependencias instaladas.
- Excluir respaldos de bases de datos.

La instalación podrá realizarse desde
el Explorador de Windows.

Se deberán detener los servidores antes
de reemplazar archivos utilizados por
procesos en ejecución.

No deberán eliminarse las carpetas originales
completas para instalar una actualización parcial.

Toda actualización deberá superar las pruebas
correspondientes en el entorno local.

---

## 5. PRINCIPIOS DE PROGRAMACIÓN

El desarrollo adoptará:

- SOLID.
- DRY.
- KISS.
- Alta cohesión.
- Bajo acoplamiento.
- Responsabilidades delimitadas.
- Reutilización.
- Validación de entradas.
- Tratamiento explícito de errores.

Las soluciones deberán responder
a necesidades concretas del sistema.

No se incorporarán abstracciones,
dependencias o mecanismos complejos
sin una justificación técnica.

---

## 6. CONVENCIONES DE NOMBRES

### 6.1. Backend

Los archivos se identificarán según
su entidad y responsabilidad.

Ejemplos:

- `torneo.routes.js`
- `torneo.controller.js`
- `torneo.service.js`
- `torneo.repository.js`
- `edicion.routes.js`
- `edicion.controller.js`
- `edicion.service.js`
- `edicion.repository.js`

Funciones y variables:

`camelCase`

Ejemplos:

- `crearTorneo`
- `buscarPorId`
- `actualizarEstado`
- `eliminarTorneo`

Clases:

`PascalCase`

Ejemplos:

- `TorneoError`
- `AuthError`

Constantes:

`MAYUSCULAS_CON_GUIONES_BAJOS`

Ejemplos:

- `APP_CONFIG`
- `ESTADOS_TORNEO`

### 6.2. Frontend

Componentes React y sus estilos particulares:

`PascalCase`

Ejemplos:

- `Torneos.jsx`
- `Torneos.css`
- `Ediciones.jsx`
- `Ediciones.css`
- `Dashboard.jsx`
- `AppLayout.jsx`

Funciones y variables:

`camelCase`

Archivos de configuración:

- `app.config.js`
- `modulos.config.js`
- `iconos.config.js`

### 6.3. Estilos CSS

Las clases específicas deberán identificar
el módulo al que pertenecen.

Ejemplos:

- `torneos-pagina`
- `torneos-indicadores`
- `dashboard-bienvenida`
- `app-sidebar`

Las clases reutilizables del Sistema de Diseño
utilizarán el prefijo `as-`.

Ejemplos:

- `as-button`
- `as-card`
- `as-input`
- `as-alert`

Las variables CSS deberán utilizar nombres
descriptivos y consistentes.

Ejemplos:

- `--color-primary`
- `--font-heading`
- `--space-4`
- `--radius-md`

### 6.4. Base de datos

Las tablas y columnas utilizarán:

- `snake_case`.
- Letras minúsculas.
- Nombres sin espacios.
- Nombres sin caracteres especiales.

Ejemplos:

- `torneos`
- `fecha_creacion`
- `fecha_actualizacion`
- `torneo_id`
- `equipos_inscritos`

### 6.5. Pruebas

Los archivos de pruebas deberán identificar
el componente y el tipo de verificación.

Ejemplos:

- `torneo.service.test.js`
- `torneo.integration.test.js`
- `edicion.service.test.js`
- `edicion.integration.test.js`

---

## 7. IDIOMA Y CONFIGURACIÓN REGIONAL

El idioma principal de ALTO-SISTEMA
será español.

La terminología deberá corresponder
al dominio del fútbol amateur.

Se conservarán las denominaciones técnicas
originales cuando corresponda.

La configuración regional inicial será:

| Propiedad | Valor |
|---|---|
| Idioma | es-AR |
| Zona horaria | America/Argentina/Cordoba |
| Codificación de archivos | UTF-8 |

La presentación de fechas y valores
numéricos deberá respetar la configuración
regional de la aplicación.

---

## 8. NORMAS DEL FRONTEND

### 8.1. Organización

El frontend utilizará componentes React
con responsabilidades identificables.

Se deberá:

- Reutilizar componentes.
- Centralizar las comunicaciones HTTP.
- Centralizar la configuración.
- Evitar catálogos de navegación duplicados.
- Gestionar estados de carga y error.
- Mostrar mensajes comprensibles.
- Mantener la adaptación responsive.
- Evitar datos estadísticos ficticios.

### 8.2. Sistema de Diseño

Todos los módulos deberán respetar
el Sistema de Diseño v1.0.

Archivos compartidos:

- `styles/tokens.css`
- `styles/typography.css`
- `styles/components.css`

Se priorizará el uso de variables CSS
y componentes visuales reutilizables.

No deberán duplicarse estilos globales
dentro de módulos particulares.

### 8.3. Tipografía e iconografía

Tipografías oficiales:

- Barlow Condensed.
- Inter.

Biblioteca de iconos:

- Lucide React.

Los módulos deberán utilizar
la iconografía centralizada cuando
representen funcionalidades del sistema.

No se utilizarán emojis como sustitutos
de los iconos estructurales.

### 8.4. Formularios

Los formularios deberán contemplar:

- Identificación de campos obligatorios.
- Validación de entradas.
- Mensajes de error.
- Estados de guardado.
- Acciones de confirmación y cancelación.

Deberán evitarse envíos duplicados
mientras una operación esté en curso.

Las validaciones de interfaz no reemplazan
las validaciones del servidor.

### 8.5. Estados de pantalla

Las pantallas deberán contemplar,
cuando corresponda:

- Carga inicial.
- Ausencia de registros.
- Búsquedas sin coincidencias.
- Errores de conexión.
- Confirmaciones.
- Reintentos.
- Datos disponibles.

Un error de consulta no deberá
representarse como una cantidad cero.

### 8.6. Accesibilidad

La interfaz deberá incorporar:

- Navegación por teclado.
- Indicadores de foco.
- Etiquetas accesibles.
- Controles táctiles adecuados.
- Mensajes de estado.
- Contraste suficiente.
- Compatibilidad con movimiento reducido.

La incorporación de estos mecanismos
no reemplaza una auditoría formal
de accesibilidad.

### 8.7. Contexto deportivo

Las funcionalidades deportivas deberán
identificar claramente el contexto
seleccionado.

El cambio de contexto deberá evitar
el uso accidental de información
perteneciente a otra competición.

HU-005 incorpora la selección del torneo
mediante la ruta privada parametrizada
`/torneos/:torneoId/ediciones`.

La selección integral del contexto deportivo
(torneo, edición y categoría) sigue pendiente
de HU-008.

### 8.8. Identidad visual

La identidad institucional deberá
permanecer separada de las identidades
personalizadas de las competiciones.

Consultar:

[SISTEMA_DE_DISENO.md](SISTEMA_DE_DISENO.md)

### 8.9. Operaciones destructivas

Las acciones de eliminación definitiva
deberán diferenciarse visualmente de
las operaciones convencionales.

Se utilizará la variante semántica:

`as-button-danger`

La interfaz deberá:

- Identificar el registro afectado.
- Solicitar confirmación explícita.
- Advertir cuando la operación sea irreversible.
- Permitir cancelar sin modificar datos.
- Bloquear acciones incompatibles durante
  la ejecución.
- Mostrar el resultado de la operación.
- Actualizar los indicadores correspondientes.

La eliminación no deberá reflejarse
como exitosa antes de recibir la
confirmación del backend.

### 8.10. Confirmaciones

Desde la versión 0.2.0 se utilizan confirmaciones
nativas del navegador para las acciones
de archivado, reactivación y eliminación.

HU-005 conserva este mecanismo e incorpora
confirmaciones para iniciar, finalizar,
reabrir y eliminar ediciones.

Este mecanismo podrá sustituirse en el futuro
por un componente de diálogo reutilizable.

La modificación no deberá reducir
las garantías de confirmación existentes.

### 8.11. EDICIONES — convenciones de interfaz

- Utilizar el cliente HTTP existente, sin nuevas dependencias.
- Mantener la navegación privada bajo AppLayout, sin agregar una opción al menú lateral.
- Identificar el torneo en la pantalla y reiniciar los estados locales cuando cambie su identificador.
- Diferenciar las fechas deportivas, opcionales y editables, de los estados manuales.
- Mostrar las fechas de calendario como DD/MM/AAAA sin conversiones de zona horaria.
- Calcular indicadores sobre el listado completo, no sobre los resultados filtrados.
- Mostrar un guion ante indicadores no disponibles, nunca un cero ficticio.
- Deshabilitar acciones incompatibles mientras se realiza una operación.

La implementación de HU-005 reutiliza los estilos
compartidos y agrega estilos específicos de EDICIONES
sin modificar el Sistema de Diseño v1.0.

---

## 9. NORMAS DEL BACKEND

### 9.1. Distribución de responsabilidades

| Capa | Función |
|---|---|
| Routes | Definición de endpoints |
| Controllers | Tratamiento HTTP |
| Services | Reglas y validaciones de negocio |
| Repositories | Persistencia |
| Middlewares | Controles transversales |
| Config | Configuración e infraestructura |

### 9.2. Validaciones

Los servicios deberán validar:

- Identificadores.
- Campos obligatorios.
- Tipos de datos.
- Longitudes.
- Estados.
- Relaciones.
- Restricciones de negocio.

Las escrituras deberán realizarse
únicamente después de validar
la operación correspondiente.

### 9.3. Acceso a datos

Las consultas SQL deberán concentrarse
en los repositorios.

Los controladores no deberán implementar
directamente operaciones SQL.

### 9.4. Tratamiento de errores

Los errores previstos deberán contar
con mensajes comprensibles y códigos
HTTP adecuados.

Los errores inesperados deberán evitar
la exposición de información interna,
credenciales o detalles sensibles.

### 9.5. Autenticación

Los endpoints administrativos y
deportivos privados deberán exigir
una sesión autenticada.

La navegación privada del frontend
no sustituye este control.

### 9.6. Eliminación de registros

Las operaciones de eliminación deberán:

- Validar el identificador recibido.
- Utilizar consultas parametrizadas.
- Limitar la operación al registro solicitado.
- Interpretar la cantidad de filas afectadas.
- Gestionar registros inexistentes.
- Gestionar restricciones de integridad.
- Preservar los registros independientes.

Los errores de dependencias deberán
traducirse en respuestas comprensibles.

La eliminación no deberá utilizarse
como mecanismo para evitar validaciones
o resolver inconsistencias de datos.

### 9.7. Operaciones contextualizadas y transaccionales

Las operaciones sobre EDICIONES deberán validar
el identificador del torneo y, cuando corresponda,
el identificador de la edición.

El repositorio delimitará las consultas individuales
por ambos identificadores. Una edición de otro torneo
no deberá poder consultarse, actualizarse ni eliminarse
mediante una ruta ajena.

Las escrituras utilizan una transacción y el bloqueo
del torneo padre mediante SELECT ... FOR UPDATE.
El servicio comprueba su existencia y estado dentro
de la operación, y el repositorio confirma o revierte
la transacción y libera la conexión.

La unicidad por torneo y nombre se garantiza mediante
MySQL, incluso ante solicitudes concurrentes.
Los conflictos conocidos se traducen a HTTP 409;
los errores inesperados se propagan al controlador.

---

## 10. NORMAS DE LA API REST

### 10.1. Métodos HTTP

| Método | Responsabilidad |
|---|---|
| GET | Consulta de recursos |
| POST | Creación o ejecución de acciones |
| PUT | Actualización de datos del recurso |
| PATCH | Actualización parcial |
| DELETE | Eliminación autorizada por el dominio |

La existencia de un método HTTP no
implica que todos los módulos deban
implementarlo.

### 10.2. Códigos de respuesta

| Código | Significado |
|---|---|
| 200 | Operación exitosa |
| 201 | Recurso creado |
| 204 | Operación sin contenido |
| 400 | Solicitud inválida |
| 401 | Autenticación requerida |
| 403 | Operación no permitida |
| 404 | Recurso inexistente |
| 409 | Conflicto de datos o dependencias |
| 500 | Error interno |
| 503 | Servicio no disponible |

### 10.3. Contratos

Las solicitudes y respuestas deberán
mantener estructuras comprensibles
y documentadas.

Los cambios incompatibles deberán
evaluarse para evitar regresiones
en los consumidores existentes.

### 10.4. Archivado y eliminación

La eliminación definitiva de una entidad
deberá responder a una regla de negocio
expresamente definida.

El archivado y la eliminación deberán
considerarse operaciones diferentes.

El archivado conserva la información
y permite una reactivación posterior.

La eliminación física retira el registro
definitivamente de la base de datos.

### 10.5. Contrato de eliminación de torneos

Endpoint:

`DELETE /api/torneos/:id`

Respuesta exitosa:

HTTP 200.

```json
{
    "mensaje": "Torneo eliminado correctamente."
}
```

Respuestas de error previstas:

| Código | Causa |
|---|---|
| 400 | Identificador inválido |
| 401 | Autenticación requerida |
| 403 | Solicitud no permitida |
| 404 | Torneo inexistente |
| 409 | Dependencias que impiden eliminar |
| 500 | Error inesperado |

El endpoint deberá respetar los controles
de autenticación y origen.

La eliminación de un torneo permite
reutilizar su nombre posteriormente.

### 10.6. Contratos de EDICIONES

Todos los endpoints requieren sesión autenticada.
La base de las rutas es `/api/torneos/:torneoId/ediciones`.

| Método | Ruta relativa | Operación |
|---|---|---|
| GET | `/` | Listado, torneo e indicadores |
| GET | `/:edicionId` | Consulta individual |
| POST | `/` | Creación |
| PUT | `/:edicionId` | Actualización de datos (admite campos parciales) |
| PATCH | `/:edicionId/estado` | Transición de estado |
| DELETE | `/:edicionId` | Eliminación definitiva |

El listado devuelve `torneo`, `ediciones`, `total`
e `indicadores`. Admite los filtros `busqueda` y `estado`;
`total` corresponde al listado filtrado y los indicadores
representan todas las ediciones del torneo.

La creación devuelve HTTP 201, encabezado Location,
`mensaje` y `edicion`. La actualización y el cambio
de estado devuelven HTTP 200 con `mensaje` y `edicion`.
La consulta individual devuelve `edicion`.
La eliminación exitosa devuelve HTTP 200:

```json
{
    "mensaje": "Edición eliminada correctamente."
}
```

Los datos admitidos para crear y editar son `nombre`,
`descripcion`, `fecha_inicio` y `fecha_finalizacion`.
El estado se administra en su endpoint específico.
El nombre incluye el año cuando corresponda; no existe
un campo independiente de año.

Los conflictos de unicidad, dependencias o transición
no permitida se informan con HTTP 409. Los datos inválidos
se informan con HTTP 400 y los recursos inexistentes
o pertenecientes a otro torneo con HTTP 404.

---

## 11. NORMAS DE PERSISTENCIA

### 11.1. Integridad

MySQL constituye la fuente de verdad
de los datos persistentes.

El modelo deberá utilizar:

- Claves primarias.
- Claves foráneas cuando corresponda.
- Restricciones de unicidad.
- Índices justificados.
- Consultas parametrizadas.
- Transacciones para operaciones relacionadas.
- Validaciones de integridad referencial.

### 11.2. Migraciones

Las modificaciones estructurales deberán
incorporarse mediante archivos SQL
versionados.

Convención:

`NNN_descripcion.sql`

Migraciones implementadas:

| Versión | Archivo |
|---|---|
| 001 | `001_usuarios.sql` |
| 002 | `002_torneos.sql` |
| 003 | `003_ediciones.sql` |

Una migración aplicada deberá permanecer
sin modificaciones posteriores.

Los cambios estructurales adicionales
requerirán una nueva migración.

### 11.3. Integridad de migraciones

El migrador deberá controlar:

- Orden de ejecución.
- Historial.
- Checksums.
- Ejecuciones concurrentes.
- Verificación estructural.
- Migraciones incompletas.

No deberán alterarse los checksums
registrados para ocultar modificaciones
accidentales de archivos SQL.

### 11.4. Verificación

Las migraciones deberán comprobarse
en entornos controlados.

Se verificará, cuando corresponda:

- Ejecución sobre una base existente.
- Ejecución sobre una base nueva.
- Idempotencia.
- Restricciones.
- Integridad estructural.
- Conservación de los datos existentes.

### 11.5. Respaldos

Antes de realizar modificaciones
estructurales relevantes deberá existir
un respaldo de la base correspondiente.

Los procedimientos deberán contemplar
la posibilidad de restauración.

### 11.6. Dialecto SQL

Los archivos SQL deberán interpretarse
utilizando el dialecto de MySQL.

Las advertencias del editor deberán
analizarse antes de modificar una
migración aplicada.

No deberá alterarse una instrucción
válida de MySQL únicamente para
satisfacer un analizador de otro
motor de base de datos.

### 11.7. Protección de entidades dependientes

Las futuras relaciones entre entidades
deportivas deberán impedir eliminaciones
que comprometan la integridad de los datos.

La relación entre torneo y edición deberá
utilizar restricciones referenciales
que impidan eliminar un torneo
con ediciones asociadas.

No deberán utilizarse eliminaciones en cascada
que destruyan información deportiva histórica.

La protección deberá verificarse mediante
pruebas de integración con MySQL real.

HU-005 implementa la primera relación deportiva
real mediante `fk_ediciones_torneo`, con
ON DELETE RESTRICT y ON UPDATE RESTRICT.

La protección se verificó mediante integración
con MySQL y el rechazo de eliminación de un torneo
con ediciones asociadas desde la interfaz.
Las relaciones posteriores deberán conservar
este principio.

### 11.8. Verificación de la versión 0.2.0

La ejecución final del migrador registró:

| Control | Resultado |
|---|---|
| Base de datos | alto_sistema |
| Migraciones registradas | 2 |
| Migraciones pendientes | 0 |
| Errores | 0 |
| Estado | Actualizada |

La incorporación de la eliminación definitiva
de torneos no requirió modificaciones
en las migraciones existentes.

### 11.9. Verificación de la versión 0.3.0

La migración `003_ediciones.sql` incorpora la tabla
`ediciones`, con nombre único dentro de cada torneo,
índice por torneo y estado, fechas opcionales y una
restricción CHECK de coherencia cronológica.

| Entorno | Verificación | Resultado |
|---|---|---|
| `alto_sistema` | Actualización de 002 a 003 y estructura | Satisfactorio |
| `altosistemahu004test` | Actualización de 002 a 003 | Satisfactorio |
| `altosistemahu005fresh` | Instalación de 001, 002 y 003 | Satisfactorio |
| `altosistemahu005fresh` | Segunda ejecución | 3 registradas, 0 pendientes |

Se conservan las migraciones anteriores sin cambios.
Antes de aplicar HU-005 se generó un respaldo preventivo.
La restauración de respaldos que incluyan torneos y
ediciones permanece pendiente de verificación.

---

## 12. ARQUITECTURA MULTITORNEO

Las funcionalidades deportivas deberán
respetar los niveles de contexto:

- Torneo.
- Edición.
- Categoría.

Las relaciones deberán verificarse
antes de consultar o modificar
información deportiva.

Los resultados, equipos, estadísticas
y demás registros deberán mantenerse
dentro de su contexto correspondiente.

No se utilizarán nombres de torneos
o categorías como condiciones fijas
de la lógica de negocio.

Las excepciones reglamentarias deberán
estar previamente definidas.

Las sanciones disciplinarias de alcance
transversal deberán contar con reglas
y pruebas específicas.

La eliminación de entidades no deberá
comprometer la independencia ni
la conservación del historial deportivo.

Consultar:

[MODELO_MULTITORNEO.md](MODELO_MULTITORNEO.md)

---

## 13. SEGURIDAD Y PRIVACIDAD

### 13.1. Credenciales

No deberán incorporarse al repositorio:

- Contraseñas.
- Secretos de sesión.
- Credenciales de MySQL.
- Archivos de entorno privados.
- Respaldos con información sensible.

Las contraseñas deberán almacenarse
mediante mecanismos de hash adecuados.

No deberán registrarse contraseñas
en logs ni exponerse sus hashes
mediante la API.

### 13.2. Solicitudes

El backend deberá mantener:

- Validación de datos.
- Autenticación.
- Controles de origen.
- Consultas parametrizadas.
- Gestión segura de sesiones.

Las operaciones DELETE deberán respetar
los mismos controles de seguridad
que las restantes escrituras.

### 13.3. Dependencias

Las dependencias deberán revisarse
periódicamente para detectar posibles
vulnerabilidades.

No deberán aplicarse actualizaciones
forzadas sin evaluar su impacto.

### 13.4. Privilegios

Las cuentas utilizadas por la aplicación
deberán disponer únicamente de los
permisos necesarios.

### 13.5. Datos personales

Los datos personales registrados en
las futuras listas de buena fe deberán
mantenerse dentro del entorno privado.

No deberán incluirse automáticamente
en publicaciones deportivas.

### 13.6. Producción

Antes del despliegue se deberá evaluar:

- Rotación de credenciales de desarrollo.
- Configuración de producción.
- Protección de sesiones.
- HTTPS.
- Permisos.
- Respaldos.
- Exposición de información.

---

## 14. DEPENDENCIAS

Cada nueva dependencia deberá evaluarse
considerando:

- Necesidad funcional.
- Compatibilidad.
- Seguridad.
- Mantenimiento.
- Licencia.
- Rendimiento.
- Costo.

Se priorizarán las funcionalidades
nativas cuando resulten suficientes.

Los archivos `package-lock.json`
deberán mantenerse versionados.

### 14.1. Instalación reproducible

Para instalar las dependencias existentes
se utilizará preferentemente:

```bash
npm ci
```

La incorporación de nuevas dependencias
se realizará mediante npm.

### 14.2. Dependencias visuales

La versión 0.2.0 incorpora:

- `@fontsource/inter`
- `@fontsource/barlow-condensed`
- `lucide-react`

Estas dependencias forman parte del
Sistema de Diseño v1.0.

La ampliación de eliminación de torneos
no requirió dependencias adicionales.

### 14.3. Auditorías

Las auditorías de dependencias deberán
interpretarse según el momento de
su ejecución.

La ausencia de vulnerabilidades detectadas
no constituye una garantía permanente
de seguridad.

---

## 15. PRUEBAS

### 15.1. Estrategia

Cada historia de usuario deberá incluir
las pruebas necesarias para verificar
su comportamiento.

Tipos de pruebas:

- Unitarias.
- Integración.
- Funcionales.
- Regresión.
- Integridad de datos.
- Revisión visual.
- Adaptación responsive.
- Rendimiento, cuando corresponda.

### 15.2. Pruebas unitarias

Las pruebas unitarias deberán comprobar
las reglas de negocio y validaciones
de los servicios correspondientes.

Se contemplarán casos válidos,
inválidos y condiciones límite.

Los componentes dependientes deberán
aislarse cuando resulte necesario.

### 15.3. Pruebas de integración

Las pruebas de integración deberán
verificar la comunicación entre
componentes reales del sistema.

Podrán involucrar:

- API REST.
- Autenticación.
- Sesiones.
- MySQL.
- Persistencia.
- Restricciones de integridad.

Las pruebas deberán evitar modificaciones
destructivas sobre los datos reales.

### 15.4. Aislamiento de datos

Las pruebas de integración que realicen
escrituras deportivas deberán utilizar
entornos controlados.

HU-004 y HU-005 utilizan:

| Propiedad | Valor |
|---|---|
| Base de pruebas | altosistemahu004test |
| Puerto de backend de pruebas | 3001 |

Las integraciones de torneos y ediciones no deberán
ejecutarse contra la base principal.

HU-005 reutiliza la base aislada después de aplicar
la migración 003. Se utiliza además
`altosistemahu005fresh` para verificar instalación limpia,
sin modificar las otras bases.

Los registros temporales deberán
identificarse y limpiarse de forma
controlada.

La separación entre entornos deberá
comprobarse antes de realizar escrituras.

### 15.5. Pruebas del frontend

Las verificaciones técnicas incluirán:

```bash
npm run lint
npm run build
```

Los errores de análisis estático
deberán corregirse sin deshabilitar
reglas únicamente para ocultarlos.

La compilación exitosa no reemplaza
las pruebas funcionales.

### 15.6. Revisión visual

La incorporación de nuevas pantallas
deberá verificar:

- Coherencia con el Sistema de Diseño.
- Jerarquía tipográfica.
- Iconografía.
- Alineaciones.
- Formularios.
- Estados.
- Distribución de contenido.
- Adaptación a pantallas pequeñas.

La simulación móvil mediante el navegador
deberá distinguirse de una prueba realizada
en un dispositivo físico.

### 15.7. Regresión

Cada incremento deberá comprobar que
las funcionalidades anteriores continúan
operativas.

Se deberá verificar especialmente:

- Autenticación.
- Sesiones.
- Navegación.
- Conexión con MySQL.
- Persistencia.
- Integridad de migraciones.
- Independencia entre competiciones.

### 15.8. Registro de resultados

Los resultados deberán distinguir:

- Pruebas aprobadas.
- Pruebas fallidas.
- Pruebas omitidas.
- Pruebas pendientes.
- Controles internos.

Una prueba de integración que incluya
varias verificaciones internas deberá
contabilizarse como una única prueba
automatizada, sin duplicar sus resultados.

Los resultados obtenidos mediante ejecuciones
separadas podrán consolidarse siempre que
correspondan a la misma implementación.

### 15.9. Resultados definitivos de HU-004

| Control | Resultado |
|---|---|
| Pruebas unitarias de autenticación | 13/13 |
| Pruebas unitarias de torneos | 30/30 |
| Total de pruebas unitarias | 43/43 |
| Integración de autenticación | 1/1 |
| Integración de torneos | 1/1 |
| Total de pruebas automatizadas | 45/45 |
| Controles internos de integración | 20/20 |
| Pruebas fallidas | 0 |
| ESLint: errores | 0 |
| ESLint: advertencias | 0 |
| Compilación de producción | Exitosa |
| Tiempo de compilación final | 3,49 segundos |
| Revisión visual inicial | 8/8 |
| Validación funcional | Satisfactoria |
| Migraciones pendientes | 0 |
| Limpieza de registros temporales | Completada |

La totalidad de las pruebas fue verificada
mediante ejecuciones separadas.

Los 20 controles internos corresponden
a una única prueba de integración.

### 15.10. Ejecuciones de regresión

| Ejecución | Totales | Aprobadas | Omitidas | Fallidas |
|---|---:|---:|---:|---:|
| Pruebas unitarias | 45 | 43 | 2 | 0 |
| Regresión con integración de autenticación | 45 | 44 | 1 | 0 |
| Integración aislada de torneos | 1 | 1 | 0 | 0 |

Los tiempos registrados fueron:

| Ejecución | Duración |
|---|---:|
| Pruebas unitarias | 523,10 ms |
| Regresión con integración de autenticación | 716,46 ms |
| Integración aislada de torneos | 1414,30 ms |
| Compilación del frontend | 3,49 s |

Los tiempos corresponden al entorno local
y no constituyen mediciones de rendimiento
en producción.

### 15.11. Pruebas de eliminación

Las operaciones destructivas deberán
contemplar verificaciones específicas.

En HU-004 se incorporaron seis pruebas
unitarias adicionales para comprobar:

- Eliminación de torneos activos.
- Eliminación de torneos archivados.
- Identificadores inválidos.
- Registros inexistentes.
- Errores de dependencia.
- Errores inesperados de persistencia.

Las pruebas de integración verifican
la eliminación física, la independencia
entre torneos y la reutilización de nombres.

La cancelación de eliminación fue comprobada
mediante la interfaz administrativa.

En HU-004 el tratamiento de errores de dependencia
fue verificado mediante simulación.

En HU-005 se incorporó y verificó la restricción
referencial real entre torneos y ediciones.

### 15.12. Criterios de aceptación de HU-004

| Grupo | Resultado |
|---|---|
| CA-01 a CA-14 | Verificados |
| CA-15: eliminación definitiva | Verificado |
| CA-16: cancelación de eliminación | Verificado |
| CA-17: independencia tras eliminación | Verificado |
| CA-18: reutilización del nombre | Verificado |

Los 18 criterios funcionales fueron
verificados durante el desarrollo.

HU-004 fue aprobada y consolidada en el commit
`27654c0`, correspondiente a v0.2.0.

### 15.13. Verificaciones futuras

Permanecen pendientes:

- Pruebas automatizadas del frontend.
- Pruebas visuales automatizadas.
- Auditoría formal de accesibilidad.
- Validación en dispositivos móviles físicos.
- Pruebas de rendimiento y carga.
- Restauración de respaldo que incluya las tablas torneos y ediciones.
- Verificación real de las claves foráneas de entidades aún no implementadas.
- Evaluación de seguridad de producción.

Estas verificaciones deberán incorporarse
en las etapas correspondientes.

### 15.14. HU-005 — alcance funcional y verificaciones

**Historia de usuario:** gestión de ediciones (v0.3.0).

Como administrador, se requiere registrar, consultar,
modificar y administrar las ediciones de cada torneo,
manteniendo su independencia y su ciclo de vida deportivo.

Reglas implementadas:

- Cada edición pertenece a un único torneo.
- El nombre es libre, obligatorio, de hasta 100 caracteres y único dentro del torneo según la colación de MySQL.
- El año forma parte del nombre, cuando corresponde; no se registra por separado.
- La descripción es opcional, de hasta 500 caracteres.
- Las fechas de inicio y finalización son opcionales, independientes y editables; pueden quitarse.
- Si ambas fechas existen, la finalización no puede ser anterior al inicio.
- El estado inicial es PLANIFICADA; las transiciones manuales son PLANIFICADA a EN_CURSO, EN_CURSO a FINALIZADA y FINALIZADA a EN_CURSO.
- Las fechas no cambian automáticamente el estado. Repetir el estado actual no requiere una escritura.
- Se admiten varias ediciones simultáneas, incluso EN_CURSO dentro del mismo torneo.
- En un torneo archivado se permite consultar, editar, finalizar ediciones en curso y eliminar ediciones sin dependencias; no crear, iniciar ni reabrir.
- La eliminación es definitiva, requiere confirmación desde la interfaz y no afecta otras ediciones.
- No se puede eliminar un torneo con ediciones asociadas.
- Las categorías, la identidad visual deportiva y el selector integral de contexto pertenecen a historias posteriores.

La validación funcional y visual se organizó en 17
controles. Estos no sustituyen el CHECK integral formal.

| Nº | Control funcional | Resultado |
|---:|---|---|
| 01 | Integración visual con TORNEOS | Verificado |
| 02 | Navegación hacia EDICIONES | Verificado |
| 03 | Creación de ediciones | Verificado |
| 04 | Fechas opcionales | Verificado |
| 05 | Modificación de fechas | Verificado |
| 06 | Inicio | Verificado |
| 07 | Finalización | Verificado |
| 08 | Reapertura | Verificado |
| 09 | Indicadores internos | Verificado |
| 10 | Ediciones simultáneas | Verificado |
| 11 | Modificación de nombre y descripción | Verificado |
| 12 | Eliminación de fechas | Verificado |
| 13 | Búsqueda y filtros | Verificado |
| 14 | Indicadores externos de TORNEOS | Verificado |
| 15 | Restricciones de torneos archivados | Verificado |
| 16 | Eliminación e integridad referencial | Verificado |
| 17 | Adaptación responsive | Verificado por confirmación del administrador |

La prueba responsive se realizó mediante simulación
indicada de 390 × 844 px, según confirmación del
administrador; no se recibió una captura móvil.
Los registros temporales se eliminaron tras las pruebas.

### 15.15. HU-005 — secuencia de implementación

| Orden | Trabajo | Resultado |
|---:|---|---|
| 1 | Alcance, reglas y modelo de datos | Definidos |
| 2 | Respaldo preventivo y migración 003 | Ejecutados |
| 3 | Repository, Service, Controller y Routes | Implementados |
| 4 | Integración de rutas en server.js y migrador actualizado | Implementada |
| 5 | Ediciones.jsx y Ediciones.css | Implementados |
| 6 | App.jsx, Torneos.jsx y Torneos.css | Integrados |
| 7 | ESLint y compilación | Satisfactorios |
| 8 | Pruebas unitarias, integración y regresión | Satisfactorias |
| 9 | Instalación limpia e idempotencia | Satisfactorias |
| 10 | Validación funcional y responsive | Satisfactoria |
| 11 | Limpieza de registros de prueba | Completada |
| 12 | Actualización de versión y reinicio | Completados |
| 13 | Documentación, capturas y CHECK integral | En consolidación |
| 14 | Commit y publicación | Pendientes |

### 15.16. HU-005 — resultados de pruebas automatizadas

| Prueba | Aprobadas | Duración de ejecución |
|---|---:|---:|
| Unitarias de EDICIONES | 59/59 | 445,5618 ms |
| Regresión unitaria de AUTENTICACIÓN y TORNEOS | 43/43 | 302,3158 ms |
| Integración HTTP/MySQL de EDICIONES | 1/1 | 1860,0626 ms |
| Regresión de integración de TORNEOS | 1/1 | 1394,3234 ms |
| Regresión de integración de AUTENTICACIÓN | 1/1 | 503,2238 ms |
| **Total de pruebas únicas** | **105/105** | — |

Totales: 102 unitarias (59 de ediciones, 30 de torneos,
13 de autenticación) y tres de integración.
No se informaron fallos, cancelaciones ni omisiones
en las ejecuciones específicas registradas.

ESLint: sin errores informados por el administrador.
Compilación de producción: exitosa en 2,52 segundos.
Los tiempos son del entorno local y no son pruebas de carga.

La integración de EDICIONES contiene 14 bloques:
base y sesión aisladas; torneos temporales; autenticación
y origen; creación; validaciones y concurrencia; filtros e
indicadores; aislamiento por torneo; edición parcial;
transiciones; archivado; persistencia SQL; FK, CHECK y UNIQUE;
eliminación y reutilización; limpieza.

El resultado global informado fue 1/1 aprobado. Se conserva
el alcance de los 14 bloques del archivo de integración,
sin contabilizarlos como pruebas adicionales ni afirmar
que se recibió el detalle individual de sus diagnósticos.

### 15.17. Ejecución específica de HU-005

Desde `backend`:

```bash
node --test tests/edicion.service.test.js
```

Para la integración de EDICIONES se utiliza el servidor
aislado del puerto 3001, con la migración 003 aplicada,
y un administrador de pruebas habilitado.

Variables temporales:

- `DB_NAME=altosistemahu004test`
- `ALTO_EDICION_INTEGRATION_TEST=1`
- `ALTO_TEST_USER` (administrador de pruebas)
- `ALTO_TEST_PASSWORD` (credencial privada)

```bash
node --test tests/edicion.integration.test.js
```

No ejecutar las escrituras deportivas de integración contra
la base principal. Verificar la base seleccionada, restaurar
las variables temporales al terminar y no publicar credenciales.
Consultar MANTENIMIENTO.md para la preparación del entorno.

### 15.18. Límites de las verificaciones de HU-005

Las pruebas unitarias simulan repositorios; la integración
utiliza HTTP y MySQL reales. El resultado satisfactorio de
ambas no equivale a una auditoría formal de seguridad,
accesibilidad, carga o producción.

Las pruebas se ejecutaron antes del cambio de número de
versión. La coherencia posterior de las versiones se verificó
por separado, así como el reinicio de los servidores.
El cierre integral y la publicación de v0.3.0 siguen pendientes.

---

## 16. CONTROL DE VERSIONES

### 16.1. Git

Git constituye el mecanismo de
control de versiones del proyecto.

Cada incremento aprobado deberá
registrarse mediante un commit
identificable.

### 16.2. Convenciones de commits

Ejemplos históricos:

```text
HU-001 - Infraestructura funcional v0.1.0
HU-002 - Autenticacion y acceso privado v0.1.1
HU-003 - Interfaz base y navegacion v0.1.2
```

Mensaje histórico de HU-004:

```text
HU-004 - Gestion integral de torneos y Sistema de Diseno v0.2.0
```

Mensaje propuesto para HU-005 (pendiente de commit):

```text
HU-005 - Gestion de ediciones v0.3.0
```

El mensaje definitivo deberá corresponder
a los cambios efectivamente incorporados.

### 16.3. Archivos excluidos

No deberán versionarse:

- `node_modules`.
- Archivos `.env` privados.
- Credenciales.
- Secretos.
- Respaldos sensibles.
- Directorios de compilación generados.
- Archivos temporales.
- Logs innecesarios.

### 16.4. Verificación previa

Antes de registrar un commit deberán
revisarse los archivos modificados
y preparados mediante Git.

Se deberá comprobar:

- Correspondencia con el incremento.
- Ausencia de archivos sensibles.
- Documentación actualizada.
- Versiones consistentes.
- Resultado del CHECK integral.

### 16.5. Publicación

Los incrementos aprobados deberán
consolidarse en el repositorio remoto.

La publicación en GitHub deberá
realizarse después de comprobar
el contenido del commit.

No se publicarán incrementos como
aprobados sin completar su validación.

---

## 17. VERSIONADO

### 17.1. Formato

Se utilizará la estructura:

`MAYOR.MENOR.PARCHE`

| Componente | Significado |
|---|---|
| MAYOR | Transformaciones incompatibles o de gran alcance |
| MENOR | Incorporación de funcionalidades |
| PARCHE | Correcciones y mejoras compatibles |

Durante la fase 0.x.x, la numeración
también identificará los incrementos
del desarrollo inicial.

### 17.2. Sincronización

La versión de la aplicación deberá
mantenerse consistente entre:

- Configuración del backend.
- Configuración del frontend.
- `backend/package.json`.
- `backend/package-lock.json`.
- `frontend/package.json`.
- `frontend/package-lock.json`.
- Documentación vigente.
- Identificación visual de versión.

### 17.3. Actualización de paquetes

La actualización de la versión npm
podrá realizarse mediante:

```bash
npm version 0.3.0 --no-git-tag-version --ignore-scripts
```

La versión utilizada deberá corresponder
al incremento que se esté preparando.

El comando no sustituye la actualización
de las configuraciones propias
de la aplicación.

### 17.4. Versionado del Sistema de Diseño

El Sistema de Diseño dispone de su
propia identificación interna.

Su versión inicial es 1.0.

Esta numeración no constituye una
versión independiente de ALTO-SISTEMA.

El Sistema de Diseño v1.0 se incorporó
con la versión 0.2.0 y HU-004.
HU-005 lo conserva sin incrementar
su versión interna.

### 17.5. Versión estable

La versión 1.0.0 identificará la primera
versión estable destinada a la operación
real del sistema.

Su aprobación dependerá del cumplimiento
de los requisitos establecidos.

### 17.6. Ampliaciones antes de consolidar

Las funcionalidades adicionales incorporadas
a una historia de usuario todavía abierta
podrán conservar la versión prevista
para ese incremento.

La eliminación definitiva incorporada
durante HU-004 conserva la versión 0.2.0,
debido a que el incremento todavía no
había sido consolidado.

### 17.7. Coherencia de v0.3.0

Se actualizaron los seis archivos de configuración
y paquetes de backend y frontend. El control de lectura
confirmó ocho valores 0.3.0, incluyendo las versiones
raíz dentro de ambos package-lock.json.

El backend principal inició con v0.3.0 en el puerto 3000,
MySQL y sesiones en línea, y los módulos de autenticación,
torneos y ediciones habilitados. El reinicio del frontend
fue confirmado por el administrador.

El servidor de pruebas del puerto 3001 fue detenido.
Las bases aisladas se conservan para futuras verificaciones.

---

## 18. DOCUMENTACIÓN

### 18.1. Documentos oficiales

| Archivo | Responsabilidad |
|---|---|
| README.md | Presentación y estado del proyecto |
| ARQUITECTURA.md | Organización técnica |
| MODELO_MULTITORNEO.md | Modelo y reglas deportivas |
| DESARROLLO.md | Metodología de desarrollo |
| MANTENIMIENTO.md | Procedimientos operativos |
| SISTEMA_DE_DISENO.md | Estándares visuales |

### 18.2. Actualización

La documentación deberá actualizarse
cuando existan cambios relevantes en:

- Arquitectura.
- Modelo de datos.
- Reglas deportivas.
- API REST.
- Dependencias.
- Sistema de Diseño.
- Procedimientos operativos.
- Seguridad.
- Resultados de pruebas.
- Requisitos de despliegue.

### 18.3. Edición

Los documentos Markdown deberán
editarse directamente desde VS Code.

Las actualizaciones deberán conservar
las decisiones previamente aprobadas.

No deberán introducirse nuevas reglas
de negocio mediante cambios de
documentación no autorizados.

### 18.4. Estado de las funcionalidades

La documentación deberá distinguir
entre elementos:

- Planificados.
- Implementados.
- Verificados.
- Aprobados.

Las funcionalidades futuras no deberán
presentarse como operativas.

### 18.5. Capturas de pantalla

Las capturas deberán corresponder
a la versión indicada.

No deberán exponer:

- Contraseñas.
- Secretos.
- Datos personales sensibles.
- Información privada innecesaria.

Las capturas de versiones anteriores
podrán conservarse como registro
histórico si están identificadas.

### 18.6. Consolidación documental

Antes de finalizar una historia de usuario
deberán revisarse los documentos afectados
por las funcionalidades incorporadas.

Las ampliaciones realizadas durante
la validación deberán reflejarse
en la documentación definitiva.

Los resultados provisionales deberán
reemplazarse por los resultados
efectivamente obtenidos.

---

## 19. RENDIMIENTO

Las optimizaciones deberán justificarse
mediante observaciones o mediciones.

Se evitarán:

- Consultas innecesarias.
- Consultas repetidas dentro de bucles.
- Recálculos deportivos redundantes.
- Carga injustificada de información.
- Renderizados innecesarios.
- Dependencias sobredimensionadas.
- Duplicación de estilos.

Se evaluará, cuando corresponda:

- Paginación.
- Índices adicionales.
- Optimización de consultas.
- Carga diferida.
- División de código.
- Optimización de recursos visuales.
- Cancelación de solicitudes innecesarias.

La incorporación de una optimización
deberá mantener la corrección funcional
y la integridad de los datos.

La optimización de variantes tipográficas
innecesarias permanece pendiente.

HU-005 utiliza la API de EDICIONES para los indicadores
en las tarjetas de TORNEOS, con un máximo de cuatro
consultas simultáneas. Esta solución realiza una consulta
adicional por torneo. Si aumenta el volumen de registros,
se evaluará una consulta agregada o endpoint específico
que reduzca la cantidad de solicitudes. No se considera
una optimización ya implementada ni medida.

---

## 20. SOSTENIBILIDAD ECONÓMICA

ALTO-SISTEMA deberá priorizar soluciones
económicamente sostenibles y adecuadas
a sus necesidades operativas.

Se evaluará:

- Costo de infraestructura.
- Límites de almacenamiento.
- Disponibilidad.
- Mantenimiento.
- Consumo de recursos.
- Posibilidad de crecimiento.

No se contratarán servicios pagos
sin evaluar su necesidad y contar
con autorización.

Las condiciones de los servicios
gratuitos deberán comprobarse antes
de su utilización en producción.

---

## 21. CRITERIO DE FINALIZACIÓN

Una historia de usuario estará finalizada
cuando cumpla todos los requisitos
correspondientes.

### 21.1. Lista de control general

- [ ] Alcance funcional implementado.
- [ ] Arquitectura respetada.
- [ ] Reglas de negocio satisfechas.
- [ ] Validaciones incorporadas.
- [ ] Persistencia verificada.
- [ ] Seguridad comprobada.
- [ ] Sistema de Diseño respetado.
- [ ] Pruebas automatizadas aprobadas.
- [ ] Pruebas funcionales aprobadas.
- [ ] Regresión verificada.
- [ ] Documentación actualizada.
- [ ] Registros temporales limpiados.
- [ ] CHECK integral aprobado.
- [ ] Versionado consistente.
- [ ] Commit registrado.
- [ ] Repositorio remoto actualizado.

Los controles que no correspondan
al alcance de una historia deberán
identificarse como no aplicables.

### 21.2. Aprobación

La aprobación deberá realizarse de
manera expresa después de verificar
los criterios de aceptación.

No se avanzará hacia una nueva
historia de usuario antes de completar
la consolidación del incremento anterior.

### 21.3. Calidad permanente

La calidad técnica y funcional constituye
una responsabilidad permanente durante
todo el desarrollo de ALTO-SISTEMA.

### 21.4. Estado de cierre de HU-004 (histórico)

- [x] Implementación de gestión integral de torneos.
- [x] Sistema de Diseño v1.0.
- [x] Eliminación definitiva incorporada.
- [x] Validación funcional.
- [x] Pruebas automatizadas: 45/45.
- [x] Controles internos de integración: 20/20.
- [x] ESLint sin errores ni advertencias.
- [x] Compilación exitosa.
- [x] Integridad de migraciones.
- [x] Limpieza de registros temporales.
- [x] Actualización de versión a 0.2.0.
- [x] Consolidación documental definitiva.
- [x] Capturas oficiales de la versión.
- [x] Aprobación formal del CHECK integral.
- [x] Commit.
- [x] Publicación en GitHub.

HU-004 quedó aprobada y consolidada en v0.2.0
mediante el commit `27654c0`.

### 21.5. Estado de cierre de HU-005

- [x] Alcance funcional definido e implementado.
- [x] Migración 003 aplicada y estructura verificada.
- [x] Instalación desde cero e idempotencia.
- [x] Backend y frontend integrados.
- [x] Pruebas automatizadas: 105/105.
- [x] Regresión de HU anteriores.
- [x] ESLint y compilación de producción.
- [x] Validaciones funcionales: 17/17.
- [x] Integridad referencial real.
- [x] Responsive confirmado por el administrador.
- [x] Limpieza de registros deportivos temporales.
- [x] Auditoría inicial de archivos Git.
- [x] Actualización a v0.3.0 y coherencia de versiones: 8/8.
- [x] Reinicio controlado y cierre del servidor de pruebas.
- [ ] Consolidación documental definitiva.
- [ ] Capturas oficiales de v0.3.0.
- [ ] CHECK integral y aprobación formal.
- [ ] Commit.
- [ ] Publicación en GitHub.

HU-005 se encuentra técnica y funcionalmente verificada.
La versión local es v0.3.0; la última versión consolidada
en Git es v0.2.0. No se comenzará HU-006 hasta completar
el cierre formal y la publicación de HU-005.

Las verificaciones pendientes fuera del alcance actual
se mantienen registradas en las secciones de calidad,
persistencia y seguridad.

---

**ALTO-SISTEMA**

Sistema integral de gestión deportiva.
