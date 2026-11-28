# ALTO-SISTEMA — Manual de mantenimiento

Versión de referencia: 0.3.0

Entorno principal: Windows 11.

Estado: implementación técnica y funcional verificada.
HU-004 consolidada. HU-005 pendiente de CHECK integral, cierre documental y publicación.

---

## 1. OBJETIVO

Establecer los procedimientos necesarios para
mantener ALTO-SISTEMA operativo, actualizado,
seguro y recuperable.

Este manual contempla:

- Instalación.
- Configuración.
- Inicio y detención de servicios.
- Administración de usuarios.
- Administración de competiciones.
- Migraciones.
- Respaldos.
- Restauración.
- Pruebas automatizadas.
- Diagnóstico de errores.
- Actualización de versiones.
- Control de versiones.
- Seguridad operativa.

Los procedimientos deberán actualizarse
conforme evolucione el sistema.

---

## 2. ENTORNO DE DESARROLLO

### 2.1. Herramientas principales

| Herramienta | Utilización |
|---|---|
| Windows 11 | Sistema operativo |
| VS Code | Editor de código |
| PowerShell | Terminal |
| Node.js | Ejecución del backend |
| npm | Gestión de dependencias |
| MySQL Server 8 | Persistencia |
| MySQL Client | Administración de datos |
| mysqldump | Generación de respaldos |
| Git | Control de versiones |
| GitHub | Repositorio remoto |
| Navegador web | Operación y pruebas |

### 2.2. Versiones del entorno local

| Herramienta | Versión utilizada |
|---|---|
| Node.js | 24.20.0 |
| npm | 11.19.0 |
| MySQL | 8.0.45 |
| Git | 2.55.0 para Windows |
| ALTO-SISTEMA | 0.3.0 |
| Sistema de Diseño | 1.0 |

Las versiones corresponden al entorno
utilizado durante el desarrollo.

No constituyen una obligación de actualizar
automáticamente cada herramienta cuando
aparezca una nueva versión.

### 2.3. Verificación

Desde PowerShell:

```powershell
node --version
npm --version
git --version
```

Para verificar el cliente de MySQL:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" --version
```

La ubicación del ejecutable podrá variar
según la instalación.

---

## 3. ORGANIZACIÓN DEL PROYECTO

### 3.1. Directorios principales

```text
ALTO-SISTEMA/
├── backend/
├── database/
├── docs/
├── frontend/
├── .gitignore
└── README.md
```

### 3.2. Responsabilidades

| Directorio | Responsabilidad |
|---|---|
| backend | API REST y lógica de negocio |
| database | Migraciones SQL |
| docs | Documentación técnica |
| frontend | Interfaz administrativa |

### 3.3. Archivos privados

Los archivos de configuración privada
deberán permanecer fuera del repositorio.

Especialmente:

- backend/.env
- Archivos .env adicionales.
- Respaldos de bases de datos.
- Credenciales.
- Secretos de sesión.

Los archivos generados por la instalación
de dependencias tampoco deberán versionarse.

---

## 4. INSTALACIÓN DEL PROYECTO

### 4.1. Repositorio

Repositorio oficial:

https://github.com/fbacalini90/ALTO-SISTEMA

Para obtener una copia nueva:

```powershell
git clone https://github.com/fbacalini90/ALTO-SISTEMA.git
```

Ingresar al directorio:

```powershell
cd ALTO-SISTEMA
```

### 4.2. Backend

Desde la raíz del proyecto:

```powershell
cd backend
npm ci
```

### 4.3. Frontend

Desde otra terminal ubicada en la raíz:

```powershell
cd frontend
npm ci
```

El comando npm ci instala las dependencias
conforme a los archivos package-lock.json.

### 4.4. Consideraciones

No deberán copiarse directorios node_modules
desde otras instalaciones.

Las dependencias deberán reconstruirse
mediante npm cuando resulte necesario.

La instalación deberá completarse antes
de iniciar los servidores.

---

## 5. CONFIGURACIÓN DE MYSQL

### 5.1. Servicio de Windows

El servicio utilizado en el entorno
principal es:

`MySQL80`

Para consultar su estado:

```powershell
Get-Service -Name MySQL80
```

Si se encuentra detenido, podrá iniciarse
desde una terminal con los permisos
administrativos correspondientes:

```powershell
Start-Service -Name MySQL80
```

### 5.2. Conexión mediante cliente

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u TU_USUARIO -p
```

La contraseña deberá ingresarse
cuando el cliente la solicite.

No deberá incluirse directamente
en la línea de comandos.

### 5.3. Base principal

Nombre:

`alto_sistema`

Configuración:

| Propiedad | Valor |
|---|---|
| Motor de almacenamiento | InnoDB |
| Codificación | utf8mb4 |
| Intercalación | utf8mb4_unicode_ci |
| Puerto habitual | 3306 |

Para una instalación nueva:

```sql
CREATE DATABASE IF NOT EXISTS alto_sistema
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

La creación inicial de la base deberá
realizarse con una cuenta autorizada.

Las tablas de la aplicación serán
administradas mediante el migrador.

### 5.4. Usuario de aplicación

La aplicación deberá utilizar una cuenta
de MySQL con permisos apropiados sobre
las bases que administra.

No deberá utilizarse la cuenta root
como cuenta habitual del backend.

Las credenciales deberán conservarse
en la configuración privada.

---

## 6. CONFIGURACIÓN DEL ENTORNO

### 6.1. Backend

Archivo:

`backend/.env`

Configuración de referencia:

```env
PORT=3000
HOST=127.0.0.1
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=TU_USUARIO
DB_PASSWORD=TU_CONTRASENA
DB_NAME=alto_sistema

SESSION_SECRET=TU_SECRETO_ALEATORIO
```

Los valores de ejemplo deberán reemplazarse
por los correspondientes a cada instalación.

### 6.2. Secreto de sesión

El secreto deberá ser suficientemente
aleatorio y mantenerse privado.

Podrá generarse mediante Node.js:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

El resultado deberá incorporarse al archivo
.env sin publicarlo en el repositorio.

Modificar el secreto existente puede
invalidar sesiones previamente emitidas.

### 6.3. Frontend

La dirección de la API podrá configurarse
mediante la variable:

```env
VITE_API_URL=http://localhost:3000/api
```

Las variables del frontend no deberán
contener secretos ni credenciales.

Los valores incorporados a una compilación
del frontend pueden quedar disponibles
para el navegador.

### 6.4. Entornos temporales

Las pruebas aisladas podrán utilizar
variables de entorno temporales.

No deberá modificarse el archivo .env
principal para ejecutar pruebas
de integración de torneos y ediciones.

---

## 7. MIGRACIONES DE BASE DE DATOS

### 7.1. Responsabilidad

El migrador administra la evolución
estructural de MySQL.

Ubicación:

`backend/src/migrate.js`

Archivos SQL:

```text
database/migrations/
├── 001_usuarios.sql
├── 002_torneos.sql
└── 003_ediciones.sql
```

### 7.2. Migraciones disponibles

| Versión | Archivo | Responsabilidad |
|---|---|---|
| 001 | 001_usuarios.sql | Usuarios administrativos |
| 002 | 002_torneos.sql | Registro de torneos |
| 003 | 003_ediciones.sql | Ediciones de cada torneo |

### 7.3. Ejecución

Desde el directorio backend:

```powershell
npm run migrate
```

### 7.4. Controles del migrador

- Orden de ejecución.
- Registro de migraciones.
- Verificación de checksums.
- Control de ejecución concurrente.
- Verificación estructural.
- Detección de migraciones incompletas.
- Identificación de migraciones pendientes.

### 7.5. Idempotencia

La ejecución repetida del migrador
no deberá duplicar migraciones
previamente aplicadas.

La versión 0.2.0 registraba dos migraciones aplicadas.
La versión 0.3.0 registra tres migraciones aplicadas.

### 7.6. Resultado esperado

```text
================================
ALTO-SISTEMA v0.3.0
MIGRACIONES DE BASE DE DATOS
================================
Base de datos: alto_sistema
Registradas: 3
Pendientes: 0
================================
BASE DE DATOS ACTUALIZADA
================================
```

Este es el resultado esperado en v0.3.0 tras una
segunda ejecución sin migraciones pendientes.
El estado de tres migraciones registradas y cero
pendientes fue verificado durante HU-005 antes del
incremento de versión de la aplicación.

### 7.7. Restricciones

No deberán modificarse los archivos SQL
que ya fueron aplicados.

No deberán alterarse los checksums
registrados para ocultar diferencias.

Toda modificación estructural deberá
incorporarse mediante una nueva migración.

Ante una migración incompleta deberá
analizarse el estado de la base antes
de intentar ejecutarla nuevamente.

### 7.8. Eliminación de torneos

La incorporación de la eliminación
definitiva no requirió una nueva
migración.

Las migraciones 001 y 002 permanecieron
sin modificaciones.

La migración 003 incorpora la relación entre torneos
y ediciones con ON DELETE RESTRICT y ON UPDATE RESTRICT.
No modifica los archivos SQL 001 y 002.


### 7.9. Migración 003 — EDICIONES

Antes de actualizar una base existente, detener las
escrituras, generar el respaldo según la sección 19 y
verificar que la conexión apunte a la base prevista.

Desde backend, ejecutar `npm run migrate` con la
configuración correspondiente. En una base que ya
posee 001 y 002, se espera una migración pendiente.
Al repetir la ejecución se esperan tres registradas y
cero pendientes. No es necesario recrear la base.

Verificación de solo lectura desde MySQL Client:

```sql
SELECT DATABASE();
SHOW CREATE TABLE ediciones;
SHOW INDEX FROM ediciones;
```

La estructura comprobada durante HU-005 contiene:

| Elemento | Definición |
|---|---|
| id | INT autoincremental, PK |
| torneo_id | INT NOT NULL, FK a torneos.id |
| nombre | VARCHAR(100) NOT NULL |
| descripcion | VARCHAR(500), nullable |
| fecha_inicio | DATE, nullable |
| fecha_finalizacion | DATE, nullable |
| estado | ENUM PLANIFICADA, EN_CURSO, FINALIZADA; default PLANIFICADA |
| fecha_creacion | TIMESTAMP, default CURRENT_TIMESTAMP |
| fecha_actualizacion | TIMESTAMP, actualización automática |
| uq_ediciones_torneo_nombre | UNIQUE (torneo_id, nombre) |
| idx_ediciones_torneo_estado | Índice (torneo_id, estado) |
| fk_ediciones_torneo | ON DELETE RESTRICT y ON UPDATE RESTRICT |
| chk_ediciones_fechas | Si ambas fechas existen, finalización >= inicio |

Motor InnoDB, utf8mb4, intercalación utf8mb4_unicode_ci.
La migración fue aplicada tanto en la base principal
como en la base aislada de integración. La instalación
desde cero se verificó por separado (sección 16.7).

No se deberá desactivar una restricción de integridad
para hacer pasar una migración o eliminar registros.

---

## 8. ADMINISTRACIÓN DE USUARIOS

### 8.1. Administrador inicial

ALTO-SISTEMA dispone de acceso privado.

La creación inicial de un administrador
se realiza mediante:

```powershell
npm run create-admin
```

El comando deberá ejecutarse desde backend
con las variables correspondientes.

### 8.2. Variables temporales

- ADMIN_USER
- ADMIN_PASSWORD

La contraseña deberá cumplir las
validaciones del sistema.

Procedimiento desde PowerShell:

```powershell
$env:ADMIN_USER = Read-Host "Nombre del administrador"

$clave = Read-Host "Contraseña del administrador" -AsSecureString

try {
    $env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $clave).Password

    npm run create-admin
} finally {
    Remove-Item Env:ADMIN_USER -ErrorAction SilentlyContinue
    Remove-Item Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue
    Remove-Variable clave -ErrorAction SilentlyContinue
}
```

### 8.3. Seguridad

Las contraseñas se almacenan mediante
hashes generados con bcrypt.

No deberán almacenarse contraseñas
en texto plano dentro de MySQL.

Los hashes tampoco deberán publicarse.

### 8.4. Recuperación de acceso

Ante la pérdida de una contraseña,
deberá utilizarse un procedimiento
administrativo controlado.

No deberá reemplazarse un hash mediante
una contraseña en texto plano.

La recuperación de contraseñas desde
la interfaz permanece pendiente.

---

## 9. INICIO DEL SISTEMA

### 9.1. Organización de terminales

Durante el desarrollo se utilizarán
preferentemente cuatro terminales.

| Terminal | Responsabilidad |
|---|---|
| 1 | Backend principal |
| 2 | Frontend |
| 3 | Backend de pruebas aislado |
| 4 | Comandos y verificaciones |

La tercera terminal solamente será
necesaria cuando se realicen pruebas
de integración que requieran aislamiento.

### 9.2. MySQL

Verificar previamente:

```powershell
Get-Service -Name MySQL80
```

El servicio deberá encontrarse iniciado.

### 9.3. Primera terminal

Desde la raíz:

```powershell
cd backend
npm start
```

Puerto habitual:

`3000`

### 9.4. Segunda terminal

Desde la raíz:

```powershell
cd frontend
npm run dev
```

Puerto habitual:

`5173`

### 9.5. Acceso a la aplicación

Abrir el navegador en:

http://localhost:5173

Ingresar mediante las credenciales
del administrador correspondiente.

### 9.6. Verificación inicial

Comprobar:

- Inicio correcto del backend.
- Disponibilidad de MySQL.
- Inicio correcto del frontend.
- Pantalla de acceso privado.
- Autenticación.
- Visualización del Dashboard.
- Disponibilidad del módulo TORNEOS.
- Acceso a EDICIONES desde un torneo, cuando exista.

---

## 10. DETENCIÓN Y REINICIO

### 10.1. Detención de servidores

En las terminales correspondientes:

```text
Ctrl + C
```

Este procedimiento detiene los
procesos de Node.js y Vite.

### 10.2. Reinicio del backend

Desde backend:

```powershell
npm start
```

### 10.3. Reinicio del frontend

Desde frontend:

```powershell
npm run dev
```

### 10.4. MySQL

No es necesario detener MySQL
para reiniciar el frontend
o el backend.

La detención del servicio deberá
realizarse únicamente cuando
exista una necesidad operativa.

### 10.5. Reemplazo de archivos

Antes de instalar una actualización
mediante archivos completos o ZIP:

1. Detener los servidores afectados.
2. Verificar la estructura del paquete.
3. Reemplazar los archivos correspondientes.
4. Conservar la configuración privada.
5. Reiniciar los servidores.
6. Ejecutar las pruebas necesarias.

No deberán reemplazarse carpetas
completas cuando la actualización
solamente incluya algunos archivos.


### 10.6. Reinicio controlado de v0.3.0

Con las versiones sincronizadas (sección 23.9):

1. Terminal 1, backend: Ctrl + C y `npm start`.
2. Verificar el puerto 3000, versión v0.3.0, conexión
   MySQL, sesiones y módulos de autenticación, torneos
   y ediciones habilitados.
3. Terminal 2, frontend: Ctrl + C y `npm run dev`.
4. Actualizar el navegador y comprobar v0.3.0.
5. Terminal 3: detener el backend aislado si ya no
   se necesitan pruebas, mediante Ctrl + C.
6. Mantener terminal 4 disponible para verificaciones.

El cierre del proceso de pruebas no elimina sus datos
ni requiere detener MySQL. El backend principal y el
frontend fueron reiniciados y el servidor aislado fue
detenido durante la consolidación local de HU-005.

Una actualización exclusivamente documental no requiere
reiniciar servidores.

---

## 11. VERIFICACIÓN DE DISPONIBILIDAD

### 11.1. Backend

La disponibilidad deberá comprobarse
mediante:

- Mensajes de inicio.
- Conexión con MySQL.
- Endpoint de disponibilidad.
- Respuestas de la API REST.

### 11.2. Frontend

El frontend deberá mostrar correctamente:

- Acceso privado.
- Menú lateral.
- Dashboard.
- Identificación de versión.
- Módulos disponibles.

### 11.3. Indicadores

El Dashboard incorpora indicadores
de infraestructura y un contador
real de torneos activos.

Las consultas fallidas no deberán
representarse mediante estadísticas
ficticias.

### 11.4. Sesiones

La verificación deberá contemplar:

- Inicio de sesión.
- Acceso a rutas privadas.
- Persistencia de sesión.
- Cierre de sesión.
- Rechazo de solicitudes no autenticadas.

---

## 12. ADMINISTRACIÓN DE TORNEOS

### 12.1. Acceso

Ingresar a ALTO-SISTEMA mediante
una sesión autenticada.

Seleccionar TORNEOS desde el menú
lateral o el acceso correspondiente.

### 12.2. Creación

Seleccionar NUEVO TORNEO.

Completar:

- Nombre obligatorio.
- Descripción opcional.

Guardar los datos.

Los nombres duplicados serán rechazados.

Todo torneo nuevo se registra inicialmente
con estado ACTIVO.

### 12.3. Edición

Seleccionar EDITAR sobre el torneo
correspondiente.

Modificar el nombre o la descripción.

Guardar los cambios.

### 12.4. Archivado

Seleccionar ARCHIVAR.

Confirmar la operación.

El torneo permanecerá registrado en MySQL
con estado ARCHIVADO.

El archivado conserva la identidad
y los datos del torneo.

### 12.5. Reactivación

Seleccionar REACTIVAR sobre un
torneo archivado.

Confirmar la operación.

El torneo recuperará el estado ACTIVO.

### 12.6. Eliminación definitiva

Seleccionar ELIMINAR sobre el torneo
correspondiente.

La interfaz solicitará una confirmación
que identificará el registro y advertirá
que la operación es irreversible.

El administrador podrá confirmar
o cancelar la operación.

Si confirma y el backend autoriza
la eliminación, el registro será
retirado físicamente de MySQL.

La operación está disponible para
torneos activos y archivados.

No existe una papelera de recuperación.

### 12.7. Cancelación de eliminación

Seleccionar Cancelar en la confirmación.

Resultado esperado:

- El torneo permanece registrado.
- No se modifica su estado.
- No se altera su descripción.
- No se modifican los indicadores.
- No se envía una solicitud DELETE.

### 12.8. Reutilización de nombres

Un torneo archivado conserva
la reserva de su nombre.

Un torneo eliminado libera su nombre
para una creación posterior.

Crear nuevamente un torneo con
el mismo nombre no recupera el
registro eliminado.

### 12.9. Dependencias de ediciones y futuras entidades

Desde v0.3.0, un torneo con ediciones asociadas
no puede eliminarse, sea activo o archivado.
La clave foránea impide la eliminación y la API
responde HTTP 409 con un mensaje comprensible.

Mensaje verificado desde la interfaz:

> No se puede eliminar el torneo porque tiene registros asociados. Podés archivarlo.

El archivado conserva sus ediciones y sus estados.
Ante una dependencia, considerar archivar el torneo;
no eliminar datos históricos para forzar su borrado.
La protección real fue verificada durante HU-005.
Las futuras entidades también deberán proteger su
integridad referencial.

### 12.10. Comparación administrativa

| Operación | Conserva datos | Reversible desde la aplicación |
|---|---|---|
| EDITAR | Conserva la identidad | Mediante nueva edición |
| ARCHIVAR | Sí | Sí |
| REACTIVAR | Sí | Sí |
| ELIMINAR | No | No |

### 12.11. Recomendaciones

Utilizar el archivado para conservar
competiciones que ya no se encuentren
administrativamente activas.

Utilizar la eliminación para registros
creados accidentalmente, pruebas o
competiciones que puedan retirarse
sin comprometer datos asociados.

Antes de confirmar una eliminación,
verificar que se haya seleccionado
el torneo correcto.

Cuando los datos sean importantes,
deberá existir un respaldo apropiado.


### 12.12. Administración de EDICIONES (HU-005)

Desde TORNEOS, seleccionar GESTIONAR EDICIONES en la
tarjeta del torneo correspondiente. No existe una
entrada independiente en el menú lateral. Cada tarjeta
muestra el total de ediciones y las que están en curso.

La pantalla permite regresar a TORNEOS, consultar
indicadores, buscar por nombre o descripción y filtrar
por estado. Los indicadores incluyen total, planificadas,
en curso y finalizadas.

**Creación y edición:** ingresar el nombre obligatorio
(hasta 100 caracteres), descripción opcional (hasta 500)
y fechas de inicio y finalización opcionales. No existe
un campo año separado: el año puede formar parte del
nombre, por ejemplo NOCTURNO 2027. Se permiten varias
ediciones en un año y simultáneamente en curso.

El nombre debe ser único dentro del torneo, sin distinguir
mayúsculas ni acentos según la colación de MySQL. Otro
torneo puede utilizar el mismo nombre. Las fechas pueden
modificarse o quitarse; si existen ambas, la finalización
no puede preceder al inicio.

| Acción | Estado de origen | Resultado |
|---|---|---|
| Crear | — | PLANIFICADA |
| Iniciar | PLANIFICADA | EN_CURSO |
| Finalizar | EN_CURSO | FINALIZADA |
| Reabrir | FINALIZADA | EN_CURSO |
| Editar | Cualquiera | Conserva el estado |
| Eliminar | Cualquiera | Eliminación física si no hay dependencias |

Los cambios de estado son manuales: las fechas no inician
ni finalizan automáticamente una edición. Repetir el
estado actual no genera una nueva transición. Las acciones
de cambio de estado y eliminación requieren confirmación
en la interfaz. La eliminación es irreversible desde la
aplicación.

### 12.13. EDICIONES de torneos archivados

| Operación | Torneo ACTIVO | Torneo ARCHIVADO |
|---|---|---|
| Consultar y filtrar | Sí | Sí |
| Crear | Sí | No |
| Editar datos y fechas | Sí | Sí |
| Iniciar | Sí | No |
| Finalizar edición en curso | Sí | Sí |
| Reabrir | Sí | No |
| Eliminar sin dependencias | Sí | Sí |

Archivar el torneo no finaliza automáticamente sus
ediciones. Para iniciar o reabrir una edición, reactivar
primero el torneo. Las futuras categorías no están
implementadas en esta versión; su relación deberá
proteger a la edición frente a eliminaciones incompatibles.

---

## 13. DIAGNÓSTICO DE LA API

### 13.1. Endpoints de torneos

| Método | Endpoint | Responsabilidad |
|---|---|---|
| GET | /api/torneos | Listado |
| GET | /api/torneos/:id | Consulta individual |
| POST | /api/torneos | Creación |
| PUT | /api/torneos/:id | Edición |
| PATCH | /api/torneos/:id/estado | Cambio de estado |
| DELETE | /api/torneos/:id | Eliminación definitiva |

Todos los endpoints requieren
autenticación.

### 13.2. Códigos HTTP

| Código | Interpretación |
|---|---|
| 200 | Operación exitosa |
| 201 | Registro creado |
| 400 | Solicitud inválida |
| 401 | Sesión no válida |
| 403 | Operación no permitida |
| 404 | Registro inexistente |
| 409 | Conflicto de datos o dependencias |
| 500 | Error interno |
| 503 | Servicio no disponible |

### 13.3. Errores de eliminación

| Situación | Acción recomendada |
|---|---|
| Identificador inválido | Revisar la solicitud |
| Sesión expirada | Iniciar sesión nuevamente |
| Origen rechazado | Revisar configuración |
| Torneo inexistente | Actualizar el listado |
| Dependencias | Conservar o archivar el torneo |
| Error interno | Revisar registros del backend |

No deberán deshabilitarse los controles
de autenticación, origen o integridad
para evitar estos errores.

### 13.4. Respuesta de eliminación

```json
{
    "mensaje": "Torneo eliminado correctamente."
}
```

La interfaz solamente deberá interpretar
la eliminación como exitosa después
de recibir una respuesta satisfactoria
del servidor.


### 13.5. Endpoints de EDICIONES

| Método | Endpoint | Operación |
|---|---|---|
| GET | `/api/torneos/:torneoId/ediciones` | Listado e indicadores |
| GET | `/api/torneos/:torneoId/ediciones/:edicionId` | Consulta individual |
| POST | `/api/torneos/:torneoId/ediciones` | Creación |
| PUT | `/api/torneos/:torneoId/ediciones/:edicionId` | Edición de datos |
| PATCH | `/api/torneos/:torneoId/ediciones/:edicionId/estado` | Cambio de estado |
| DELETE | `/api/torneos/:torneoId/ediciones/:edicionId` | Eliminación |

Todos requieren autenticación. Las escrituras respetan
los controles de origen. El listado admite `busqueda` y
`estado`; los indicadores representan el conjunto del
torneo, aunque se filtre el listado.

El estado no debe enviarse en el cuerpo de creación o
edición de datos. Usar PATCH de estado para transiciones.
El PUT admite actualización parcial en el contrato actual.
Una edición de otro torneo no puede consultarse ni
modificarse mediante un identificador de torneo ajeno.

### 13.6. Diagnóstico de EDICIONES

| Código | Situación posible | Acción |
|---|---|---|
| 400 | Datos, identificadores, fechas o estado inválidos | Revisar campos y estado |
| 401 | Sesión inválida | Autenticarse |
| 403 | Origen no permitido | Revisar configuración |
| 404 | Torneo/edición inexistente o fuera de contexto | Actualizar y revisar ruta |
| 409 | Duplicado, dependencia, transición no permitida, restricción por archivo o conflicto concurrente | Revisar estado y datos antes de reintentar |
| 500 | Error inesperado | Revisar registros del backend sin exponer información sensible |

El servicio utiliza transacciones y bloqueo del torneo
para las escrituras de EDICIONES. Ante un conflicto
concurrente, actualizar los datos antes de reintentar.

Respuesta de eliminación exitosa (HTTP 200):

```json
{
    "mensaje": "Edición eliminada correctamente."
}
```

---

## 14. PRUEBAS UNITARIAS

### 14.1. Ejecución

Desde backend:

```powershell
npm test
```

El comando utiliza Node.js Test Runner.

Las pruebas de integración permanecen
deshabilitadas de forma predeterminada.

### 14.2. Resultado esperado en v0.3.0

```text
tests 105
pass 102
fail 0
skipped 3
```

El resultado anterior es el esperado si se ejecuta `npm test`
sin habilitar integraciones. Las 105 pruebas fueron
verificadas mediante ejecuciones separadas, no mediante
una única ejecución de este comando.

### 14.3. Distribución

| Grupo | Pruebas |
|---|---:|
| Unitarias de autenticación | 13 |
| Unitarias de torneos | 30 |
| Unitarias de ediciones | 59 |
| Total de pruebas unitarias | 102 |
| Integraciones opcionales | 3 |
| Total general | 105 |

### 14.4. Pruebas de eliminación

La ampliación de HU-004 incorporó
seis pruebas unitarias adicionales.

Estas contemplan:

- Eliminación de torneo activo.
- Eliminación de torneo archivado.
- Identificador inválido.
- Registro inexistente.
- Restricción de dependencia.
- Error inesperado de persistencia.

### 14.5. Interpretación

Las pruebas omitidas no constituyen
fallos cuando corresponden a integraciones
deshabilitadas intencionalmente.

Un resultado satisfactorio de pruebas
unitarias no reemplaza las pruebas
contra MySQL real.


### 14.6. Pruebas unitarias específicas de EDICIONES

Desde backend:

```powershell
node --test tests/edicion.service.test.js
```

Resultado registrado: 59 pruebas aprobadas, cero fallidas,
canceladas u omitidas, duración 445,5618 ms.

Regresión de servicios anteriores:

```powershell
node --test tests/auth.service.test.js tests/torneo.service.test.js
```

Resultado registrado: 43/43, duración 302,3158 ms.
Los resultados combinados representan 102 pruebas unitarias.

---

## 15. INTEGRACIÓN DE AUTENTICACIÓN

### 15.1. Requisitos

- MySQL iniciado.
- Backend principal operativo.
- Administrador habilitado.
- Credenciales válidas.

### 15.2. Ejecución

Desde la cuarta terminal,
ubicada en backend:

```powershell
$env:ALTO_INTEGRATION_TEST = "1"

$env:ALTO_TEST_USER = Read-Host "Usuario de ALTO-SISTEMA"

$clave = Read-Host "Contraseña de ALTO-SISTEMA" -AsSecureString

try {
    $env:ALTO_TEST_PASSWORD = [System.Net.NetworkCredential]::new("", $clave).Password

    node --test tests/auth.integration.test.js
} finally {
    Remove-Item Env:ALTO_TEST_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:ALTO_TEST_USER -ErrorAction SilentlyContinue
    Remove-Item Env:ALTO_INTEGRATION_TEST -ErrorAction SilentlyContinue
    Remove-Variable clave -ErrorAction SilentlyContinue
}
```

### 15.3. Resultado esperado

```text
tests 1
pass 1
fail 0
skipped 0
```

Este comando ejecuta únicamente la integración de
autenticación. Resultado registrado en HU-005: 1/1,
duración total 503,2238 ms.

### 15.4. Consideraciones

Las credenciales no deberán quedar
almacenadas permanentemente en variables
de entorno de la terminal.

Las sesiones utilizadas por las pruebas
deberán cerrarse conforme al procedimiento
de integración.

---

## 16. ENTORNO AISLADO DE PRUEBAS

### 16.1. Propósito

Evitar que las pruebas de creación,
edición, archivado y eliminación
modifiquen competiciones reales.

### 16.2. Configuración

| Propiedad | Valor |
|---|---|
| Base principal | alto_sistema |
| Base de pruebas de integración | altosistemahu004test |
| Base de instalación desde cero | altosistemahu005fresh |
| Puerto principal | 3000 |
| Puerto de pruebas | 3001 |
| Administrador de pruebas | admin_pruebas |

### 16.3. Preparación de una instalación nueva

Mediante una cuenta autorizada de MySQL:

```sql
CREATE DATABASE IF NOT EXISTS altosistemahu004test
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

La cuenta utilizada por el backend
de pruebas deberá disponer de los
permisos necesarios exclusivamente
sobre las bases autorizadas.

### 16.4. Migraciones de pruebas

Desde backend:

```powershell
$anteriorDB = $env:DB_NAME

try {
    $env:DB_NAME = "altosistemahu004test"

    npm run migrate
} finally {
    $env:DB_NAME = $anteriorDB
}
```

Verificar que el migrador indique
la base de pruebas.

### 16.5. Administrador de pruebas

La cuenta admin_pruebas deberá
crearse dentro de la base aislada
mediante el procedimiento de creación
de administradores.

Durante su creación deberá configurarse
temporalmente:

```text
DB_NAME=altosistemahu004test
ADMIN_USER=admin_pruebas
```

La contraseña deberá ser exclusiva
del entorno de pruebas.

No deberá reutilizarse la contraseña
del administrador principal.

### 16.6. Restricciones

Nunca ejecutar las integraciones de torneos o ediciones
contra la base alto_sistema.

No modificar el archivo .env principal
para habilitar estas pruebas.

No utilizar nombres de competiciones
reales como registros temporales.


### 16.7. Instalación desde cero e idempotencia

La base `altosistemahu005fresh` fue creada durante HU-005
para comprobar las tres migraciones sin datos previos.
No es la base de integración HTTP ni la base principal.

Para preparar una base nueva equivalente, con una cuenta
MySQL autorizada, comprobar primero que no exista:

```sql
SHOW DATABASES LIKE 'altosistemahu005fresh';
```

Si no existe, crearla:

```sql
CREATE DATABASE altosistemahu005fresh
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Conceder permisos a la cuenta de aplicación autorizada
sobre esa base, sin ampliar privilegios globales.
Si MySQL Client no está en PATH, utilizar la ruta completa
indicada en la sección 5.2. No introducir la contraseña en
la línea de comandos.

Desde la cuarta terminal, en backend:

```powershell
$anteriorDB = $env:DB_NAME
try {
    $env:DB_NAME = "altosistemahu005fresh"
    node -e "const { pool } = require('./src/config/database'); (async () => { try { const [rows] = await pool.query('SELECT DATABASE() AS db'); console.log(rows[0].db); if (rows[0].db !== 'altosistemahu005fresh') process.exitCode = 1; } finally { await pool.end(); } })().catch(error => { console.error(error.message); process.exitCode = 1; });"
    if ($LASTEXITCODE -ne 0) { throw "Base de instalación incorrecta." }
    npm run migrate
    if ($LASTEXITCODE -ne 0) { throw "Falló la migración." }
    npm run migrate
    if ($LASTEXITCODE -ne 0) { throw "Falló la verificación de idempotencia." }
} finally {
    $env:DB_NAME = $anteriorDB
}
```

En HU-005 se verificó la primera ejecución con cero
registradas y tres pendientes, seguida de las migraciones
001, 002 y 003; la segunda registró tres y cero pendientes.
No utilizar este procedimiento para borrar o reinicializar
una base existente. Si ya existe la base de instalación,
una nueva ejecución solamente verificará idempotencia,
no una instalación desde cero.

Se conservan `altosistemahu004test` y `altosistemahu005fresh`
para futuras verificaciones. No se requiere eliminarlas
al detener el servidor de pruebas.

---

## 17. INTEGRACIÓN DE TORNEOS

### 17.1. Inicio del backend aislado

Desde la tercera terminal,
ubicada en backend:

```powershell
$anteriorDB = $env:DB_NAME
$anteriorPuerto = $env:PORT

try {
    $env:DB_NAME = "altosistemahu004test"
    $env:PORT = "3001"

    node -e "const { pool } = require('./src/config/database'); (async () => { try { const [rows] = await pool.query('SELECT DATABASE() AS db'); console.log(rows[0].db); if (rows[0].db !== 'altosistemahu004test') process.exitCode = 1; } finally { await pool.end(); } })().catch(error => { console.error(error.message); process.exitCode = 1; });"

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo verificar la base de pruebas."
    }

    npm start
} finally {
    $env:DB_NAME = $anteriorDB
    $env:PORT = $anteriorPuerto
}
```

Comprobar:

- Puerto 3001.
- Base altosistemahu004test.
- Inicio correcto del servidor.

No continuar si la base o el puerto
no corresponden al entorno de pruebas.

### 17.2. Ejecución de la integración

Desde la cuarta terminal,
ubicada en backend:

```powershell
$anteriorDB = $env:DB_NAME

$clave = Read-Host "Contraseña del administrador de pruebas" -AsSecureString

try {
    $env:DB_NAME = "altosistemahu004test"
    $env:ALTO_TORNEO_INTEGRATION_TEST = "1"
    $env:ALTO_TEST_USER = "admin_pruebas"

    $env:ALTO_TEST_PASSWORD = [System.Net.NetworkCredential]::new("", $clave).Password

    node --test tests/torneo.integration.test.js
} finally {
    $env:DB_NAME = $anteriorDB

    Remove-Item Env:ALTO_TORNEO_INTEGRATION_TEST -ErrorAction SilentlyContinue
    Remove-Item Env:ALTO_TEST_USER -ErrorAction SilentlyContinue
    Remove-Item Env:ALTO_TEST_PASSWORD -ErrorAction SilentlyContinue
    Remove-Variable clave -ErrorAction SilentlyContinue
}
```

### 17.3. Resultado esperado

```text
tests 1
pass 1
fail 0
skipped 0
```

La prueba de integración comprende
múltiples controles internos.

Estos no deberán contabilizarse como
pruebas automatizadas independientes.

### 17.4. Alcance

La integración contempla operaciones
reales contra MySQL:

- Autenticación.
- Protección de endpoints.
- Validaciones.
- Creación.
- Consulta.
- Unicidad.
- Búsqueda.
- Edición.
- Archivado.
- Reactivación.
- Persistencia.
- Eliminación definitiva.
- Independencia entre torneos.
- Reutilización de nombres.
- Cierre de sesión.
- Limpieza de registros temporales.

### 17.5. Finalización

Detener el backend aislado mediante:

```text
Ctrl + C
```

Mantener operativo el backend principal
cuando se continúe trabajando
desde la interfaz administrativa.


### 17.6. Integración de EDICIONES

Reutilizar la base `altosistemahu004test` y el backend
aislado del puerto 3001. Antes de iniciar, ejecutar las
migraciones de esa base según 16.4 y verificar que 003 esté
aplicada. Iniciar la tercera terminal según 17.1; no
continuar si la base o el puerto no corresponden.

Desde la cuarta terminal, ubicada en backend:

```powershell
$anteriorDB = $env:DB_NAME
$clave = Read-Host "Contraseña del administrador de pruebas" -AsSecureString
try {
    $env:DB_NAME = "altosistemahu004test"
    $env:ALTO_EDICION_INTEGRATION_TEST = "1"
    $env:ALTO_TEST_USER = "admin_pruebas"
    $env:ALTO_TEST_PASSWORD = [System.Net.NetworkCredential]::new("", $clave).Password
    node --test tests/edicion.integration.test.js
} finally {
    $env:DB_NAME = $anteriorDB
    Remove-Item Env:ALTO_EDICION_INTEGRATION_TEST -ErrorAction SilentlyContinue
    Remove-Item Env:ALTO_TEST_USER -ErrorAction SilentlyContinue
    Remove-Item Env:ALTO_TEST_PASSWORD -ErrorAction SilentlyContinue
    Remove-Variable clave -ErrorAction SilentlyContinue
}
```

Resultado registrado durante HU-005:

```text
tests 1
pass 1
fail 0
cancelled 0
skipped 0
todo 0
```

Duración total: 1860,0626 ms. El archivo contiene 14 bloques
internos de diagnóstico: base aislada y sesión, torneos
temporales, autenticación y origen, creación, validaciones
y concurrencia, listado e indicadores, aislamiento, edición,
transiciones, archivado, persistencia, restricciones SQL,
eliminación y limpieza. Se registró el resultado global
aprobado; no se conservaron en el intercambio las 14 líneas
de diagnóstico individuales. No se contabilizan como 14
pruebas independientes.

La integración de TORNEOS también fue repetida: 1/1,
duración 1394,3234 ms. Ejecutar las pruebas deportivas en
forma separada para mantener el aislamiento y el control
sobre los registros temporales.

Al finalizar, detener únicamente el backend aislado con
Ctrl + C si ya no se necesita. Conservar las bases de
pruebas; no modificar el archivo .env principal.

---

## 18. VERIFICACIÓN DEL FRONTEND

### 18.1. Análisis estático

Desde frontend:

```powershell
npm run lint
```

Resultado esperado:

- Sin errores.
- Sin advertencias.

### 18.2. Compilación

```powershell
npm run build
```

El resultado se genera en:

`frontend/dist/`

La carpeta dist no deberá incorporarse
al repositorio como código fuente.

### 18.3. Vista previa de compilación

Cuando resulte necesario:

```powershell
npm run preview
```

La vista previa permite verificar
la compilación generada.

No constituye un servidor
de producción definitivo.

### 18.4. Verificación visual

Comprobar:

- Acceso privado.
- Dashboard.
- Menú lateral.
- Formularios.
- Indicadores.
- Mensajes.
- Tarjetas.
- Acciones administrativas.
- Estados vacíos.
- Distribución responsive.

### 18.5. Sistema de Diseño

Las acciones destructivas deberán
utilizar la variante semántica
correspondiente.

Las acciones administrativas y el acceso a EDICIONES
de una tarjeta de torneo deberán mantenerse accesibles
y correctamente distribuidos en pantallas pequeñas.

### 18.6. Limitaciones

La simulación de dispositivos móviles
mediante el navegador no sustituye
las pruebas en dispositivos físicos.

Una compilación exitosa tampoco
garantiza por sí sola la ausencia
de errores funcionales.


### 18.7. Verificación de v0.3.0

El análisis estático de frontend fue informado sin errores.
La compilación de producción fue exitosa en 2,52 segundos.
La simulación responsive de EDICIONES se realizó a 390 × 844
píxeles mediante herramientas del navegador y fue confirmada
por el administrador. No equivale a una prueba en un equipo
móvil físico ni a una auditoría de accesibilidad.

Verificar en EDICIONES los indicadores, filtros, formulario,
fechas opcionales, tarjetas y acciones por estado. Comprobar
la advertencia y las restricciones de un torneo archivado.
No confundir un indicador no disponible con cero registros.

---

## 19. RESPALDOS DE BASE DE DATOS

### 19.1. Objetivo

Proteger la información persistente
ante errores humanos, fallas técnicas
o modificaciones incompatibles.

### 19.2. Momentos recomendados

Generar un respaldo antes de:

- Migraciones estructurales relevantes.
- Modificaciones administrativas masivas.
- Eliminaciones de información importante.
- Actualizaciones de MySQL.
- Operaciones de mantenimiento de riesgo.
- Despliegues de nuevas versiones.

### 19.3. Ubicación

Los respaldos deberán conservarse
fuera del repositorio.

Ubicación local recomendada:

```text
%LOCALAPPDATA%\ALTO-SISTEMA\backups
```

Esta ubicación reduce el riesgo de
incorporarlos accidentalmente al
control de versiones.

No constituye por sí sola una
protección frente a fallas del disco
o pérdida del equipo.

### 19.4. Generación de respaldo

Desde PowerShell:

```powershell
$directorio = Join-Path $env:LOCALAPPDATA "ALTO-SISTEMA\backups"

New-Item -ItemType Directory -Path $directorio -Force | Out-Null

$fecha = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

$archivo = Join-Path $directorio "alto_sistema_$fecha.sql"

$mysqldump = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe"

$usuario = Read-Host "Usuario de MySQL"

& $mysqldump `
    --host=localhost `
    --port=3306 `
    --user=$usuario `
    --password `
    --single-transaction `
    --no-tablespaces `
    --set-gtid-purged=OFF `
    --default-character-set=utf8mb4 `
    --result-file="$archivo" `
    alto_sistema

if ($LASTEXITCODE -ne 0) {
    throw "No se pudo completar el respaldo."
}

Get-Item -LiteralPath $archivo |
    Select-Object Name, Length, LastWriteTime
```

La contraseña será solicitada
por mysqldump.

El parámetro result-file permite
generar directamente el archivo SQL
sin depender de la codificación de
la redirección de PowerShell.

### 19.5. Verificación del respaldo

Comprobar:

- Existencia del archivo.
- Tamaño superior a cero.
- Fecha de generación.
- Ausencia de errores de ejecución.
- Correspondencia con la base esperada.

Podrá registrarse un hash SHA-256:

```powershell
Get-FileHash -LiteralPath $archivo -Algorithm SHA256
```

La existencia de un archivo no
garantiza por sí sola su recuperación.

La restauración deberá comprobarse
periódicamente.

### 19.6. Seguridad de respaldos

Los respaldos pueden contener:

- Usuarios.
- Hashes de contraseñas.
- Sesiones.
- Información administrativa.
- Información deportiva.
- Datos personales futuros.

No deberán publicarse ni compartirse
sin autorización.

### 19.7. Automatización futura

La programación periódica de respaldos,
el cifrado y la conservación de copias
externas deberán incorporarse durante
las etapas correspondientes.

Actualmente el procedimiento es manual.

No existe un RPO máximo garantizado
mientras no se automatice y verifique
la generación periódica de respaldos.


### 19.8. Respaldo previo a HU-005

Antes de aplicar la migración 003 a `alto_sistema` se
registró el respaldo:

`alto_sistema_v0.2.0_pre_HU005_2026-11-27_23-57-09.sql`

Tamaño confirmado: 5682 bytes. Ubicación local fuera del
repositorio, en `%LOCALAPPDATA%\ALTO-SISTEMA\backups`.
El respaldo corresponde a v0.2.0, por lo que no debe
interpretarse como una copia de EDICIONES ni como prueba
exitosa de restauración de v0.3.0.

Para futuros respaldos de v0.3.0, utilizar el procedimiento
19.4; podrá incorporarse la versión al nombre del archivo.
La generación de un nuevo respaldo y su restauración aislada
con las tablas torneos y ediciones siguen pendientes de
verificación específica. No publicar respaldos en GitHub.

---

## 20. RESTAURACIÓN DE RESPALDOS

### 20.1. Principio de seguridad

Toda restauración de prueba deberá
realizarse en una base independiente.

No se utilizará la base principal
como destino de una restauración
de verificación.

### 20.2. Base de restauración

Nombre recomendado:

`alto_sistema_restore_test`

### 20.3. Preparación

Ingresar a MySQL mediante una
cuenta autorizada.

Crear la base de destino:

```sql
CREATE DATABASE alto_sistema_restore_test
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Si la base ya existe, no continuar
hasta verificar su contenido.

No deberán sobrescribirse datos
de una restauración anterior
sin autorización expresa.

### 20.4. Selección del respaldo

Identificar el archivo SQL exacto
que se desea restaurar.

Comprobar que corresponda al
respaldo esperado.

El archivo no deberá contener
instrucciones que seleccionen
o eliminen la base principal.

Los respaldos generados mediante
el procedimiento de este manual
no utilizan la opción --databases.

### 20.5. Restauración mediante MySQL Client

Conectarse explícitamente a la
base de restauración:

```powershell
$usuario = Read-Host "Usuario de MySQL"

& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" `
    --host=localhost `
    --port=3306 `
    --user=$usuario `
    --password `
    --database=alto_sistema_restore_test
```

Desde el cliente MySQL verificar:

```sql
SELECT DATABASE();

SHOW TABLES;
```

La base seleccionada deberá ser
alto_sistema_restore_test.

Deberá encontrarse vacía antes
de importar un respaldo nuevo.

Ejecutar SOURCE indicando la ruta
real del archivo.

Ejemplo ilustrativo:

```sql
SOURCE C:/ruta/al/respaldo/alto_sistema_FECHA.sql
```

Utilizar la ruta correspondiente
al archivo seleccionado.

Revisar los mensajes de ejecución
y comprobar que no existan errores.

### 20.6. Verificación posterior

```sql
SELECT DATABASE();

SHOW TABLES;

SELECT COUNT(*) FROM usuarios;

SELECT COUNT(*) FROM torneos;
```

La consulta sobre torneos corresponde
a respaldos de v0.2.0 o posteriores
que incluyan esta tabla.

Para respaldos de v0.3.0 que incluyan EDICIONES, ejecutar
adicionalmente:

```sql
SELECT COUNT(*) FROM ediciones;
SHOW CREATE TABLE ediciones;
SELECT COUNT(*) AS ediciones_huerfanas
FROM ediciones e
LEFT JOIN torneos t ON t.id = e.torneo_id
WHERE t.id IS NULL;
```

Se espera cero ediciones huérfanas. Contrastar las
cantidades con los registros del respaldo elegido, no
con datos de otra fecha. No ejecutar estas consultas
sobre una copia anterior a 003 sin migrarla.

Comprobar adicionalmente:

- Estructuras de tablas.
- Restricciones.
- Cantidades de registros.
- Integridad de migraciones.
- Datos administrativos.
- Registros deportivos correspondientes.

### 20.7. Estado de verificación

Durante la consolidación de v0.1.3
se verificó una restauración en
una base independiente.

La restauración de respaldos que incluyan torneos y
ediciones permanece pendiente de verificación. La
instalación desde cero de las tres migraciones no
sustituye la comprobación de restauración de datos.

### 20.8. Recuperación real

Una restauración sobre la base
principal constituye una operación
de riesgo.

Antes de realizarla deberá:

1. Identificarse el incidente.
2. Detenerse la escritura de datos.
3. Preservarse el estado existente.
4. Seleccionarse el respaldo adecuado.
5. Verificarse el respaldo en aislamiento.
6. Autorizarse la recuperación.
7. Comprobarse la consistencia final.
8. Reiniciarse los servicios.

No deberá realizarse una restauración
completa para recuperar un único registro
sin evaluar el impacto sobre las
modificaciones posteriores al respaldo.

---

## 21. LIMPIEZA DE REGISTROS TEMPORALES

### 21.1. Propósito

Evitar que datos utilizados durante
el desarrollo permanezcan mezclados
con las competiciones reales.

### 21.2. Registros utilizados en HU-004

Durante las comprobaciones funcionales
se utilizaron registros temporales,
incluyendo:

- Prueba Nocturno Inicio 2027.
- torneo de prueba.

También podrán haberse generado
registros adicionales durante
las comprobaciones de edición
y reutilización de nombres.

### 21.3. Procedimiento oficial

Desde la versión 0.2.0, la limpieza
administrativa de torneos deberá
realizarse preferentemente mediante
el módulo TORNEOS.

Procedimiento:

1. Iniciar sesión.
2. Ingresar a TORNEOS.
3. Identificar el registro temporal.
4. Seleccionar ELIMINAR.
5. Verificar el nombre indicado.
6. Confirmar la eliminación.
7. Comprobar la actualización del listado.
8. Comprobar los indicadores.

El procedimiento podrá utilizarse
sobre torneos activos y archivados.

### 21.4. Verificación posterior

Comprobar:

- Ausencia del registro eliminado.
- Conservación de otros torneos.
- Actualización de indicadores.
- Persistencia después de recargar.
- Ausencia de errores en la interfaz.

Cuando todos los registros existentes
sean temporales, el resultado podrá
ser un listado vacío.

No deberán eliminarse competiciones
reales para conseguir un contador cero.

### 21.5. Consultas de verificación

Desde MySQL podrá comprobarse
la información sin modificarla.

```sql
SELECT DATABASE();

SELECT
    id,
    nombre,
    estado,
    fecha_creacion,
    fecha_actualizacion
FROM torneos
ORDER BY id;
```

Para verificar las cantidades:

```sql
SELECT
    COUNT(*) AS total,
    COALESCE(SUM(estado = 'ACTIVO'), 0) AS activos,
    COALESCE(SUM(estado = 'ARCHIVADO'), 0) AS archivados
FROM torneos;
```

### 21.6. Restricciones

No deberán utilizarse como procedimiento
habitual de limpieza:

- TRUNCATE TABLE.
- DROP TABLE.
- DROP DATABASE.
- DELETE sin condiciones.
- Desactivación de claves foráneas.

La disponibilidad del endpoint DELETE
evita recurrir a escrituras manuales
sobre MySQL para eliminar torneos.

Las intervenciones directas sobre
la base deberán reservarse para
situaciones justificadas de mantenimiento.

### 21.7. Resultado de HU-004

La eliminación de registros temporales
fue realizada mediante la interfaz
administrativa.

La comprobación funcional fue
confirmada satisfactoriamente.

No fue necesario modificar manualmente
la estructura de MySQL.


### 21.8. Limpieza de HU-005

Durante la validación funcional se utilizaron el torneo
`TORNEO DE PRUEBA HU005` y las ediciones `NOCTURNO 2007`
(renombrada posteriormente a `NOCTURNO 2027`) y
`COPA DE VERANO 2027`.

Se comprobó que el torneo no podía eliminarse mientras
existieran ediciones asociadas. Se eliminaron primero
las ediciones temporales, se verificaron los indicadores
en cero y finalmente se eliminó el torneo temporal.
El administrador confirmó la limpieza satisfactoria.

Para futuras pruebas, identificar explícitamente los
registros temporales. Eliminar únicamente sus ediciones
sin dependencias desde la interfaz, verificar que no
queden registros asociados y después eliminar el torneo.
No eliminar competiciones reales para conseguir un
listado vacío; el archivado es preferible cuando se debe
conservar información deportiva.

Consultas de solo lectura para verificar el contexto:

```sql
SELECT DATABASE();
SELECT t.id, t.nombre, COUNT(e.id) AS total_ediciones,
       COALESCE(SUM(e.estado = 'EN_CURSO'), 0) AS en_curso
FROM torneos t
LEFT JOIN ediciones e ON e.torneo_id = t.id
GROUP BY t.id, t.nombre
ORDER BY t.id;
```

Las bases de integración e instalación desde cero se
conservan. La limpieza de registros no implica borrar
una base de datos completa.

---

## 22. DIAGNÓSTICO DE PROBLEMAS

### 22.1. MySQL no disponible

Verificar:

```powershell
Get-Service -Name MySQL80
```

Comprobar:

- Servicio iniciado.
- Puerto correcto.
- Credenciales.
- Base de datos.
- Permisos.
- Configuración del backend.

### 22.2. Puerto ocupado

Consultar el puerto:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
```

Para el frontend:

```powershell
Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
```

Para el backend aislado:

```powershell
Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
```

Identificar el proceso antes
de intentar detenerlo.

No finalizar procesos desconocidos
de manera indiscriminada.

### 22.3. Error de autenticación

Comprobar:

- Usuario correcto.
- Contraseña correcta.
- Usuario habilitado.
- Disponibilidad del backend.
- Base de datos correspondiente.
- Estado de la sesión.

### 22.4. Error de origen

Revisar:

- Dirección utilizada en el navegador.
- FRONTEND_URL.
- Puerto del frontend.
- Configuración CORS.
- Controles de origen del backend.

No desactivar las protecciones
como solución permanente.

### 22.5. Error de migración

Revisar:

- Base seleccionada.
- Historial de migraciones.
- Archivos SQL.
- Checksums.
- Estado estructural.
- Permisos del usuario.

No modificar una migración aplicada
para evitar el error.

### 22.6. Error de nombre duplicado

Comprobar si existe un torneo
activo o archivado con el mismo nombre.

La restricción contempla diferencias
de mayúsculas, minúsculas y la
normalización de espacios.

No eliminar un torneo existente
únicamente para reutilizar su nombre
sin verificar previamente sus datos.

### 22.7. Error al eliminar un torneo

Comprobar:

- Sesión autenticada.
- Registro existente.
- Identificador válido.
- Conexión con el backend.
- Restricciones de integridad.

Si el registro ya fue eliminado,
actualizar el listado.

Si existen dependencias incompatibles,
utilizar el archivado cuando corresponda.

No deshabilitar restricciones de
integridad para forzar una eliminación.

### 22.8. Error de compilación

Desde frontend:

```powershell
npm run lint
npm run build
```

Identificar el archivo señalado.

Corregir el origen del problema
sin ocultar errores mediante
la desactivación de reglas.

### 22.9. Advertencias SQL en VS Code

Comprobar que el analizador utilice
el dialecto MySQL.

Las extensiones orientadas a otros
motores pueden producir advertencias
sobre instrucciones válidas de MySQL.

No modificar migraciones aplicadas
exclusivamente por una advertencia
del editor.

### 22.10. Indicadores incorrectos

Actualizar la consulta correspondiente.

Verificar:

- Disponibilidad de la API.
- Datos persistentes.
- Filtros administrativos.
- Estado de carga.
- Respuestas del backend.

No reemplazar indicadores reales
por valores constantes.


### 22.11. Problemas específicos de EDICIONES

- Si un torneo archivado impide iniciar, crear o reabrir
  una edición, reactivar el torneo si corresponde.
- Si se rechaza una fecha, comprobar su formato y que la
  finalización no preceda al inicio. Ambas son opcionales.
- Si se rechaza un nombre, comprobar las ediciones del
  mismo torneo, incluidas las finalizadas.
- Si una edición no se encuentra, verificar que el
  identificador corresponda al torneo de la ruta.
- Si los indicadores no se cargan, revisar las respuestas
  de la API de EDICIONES y actualizar el listado. No
  sustituir el error por un cero ficticio.
- Si el cliente mysql no se reconoce en PowerShell,
  utilizar su ruta completa (sección 5.2).
- Si el servidor aislado apunta a la base incorrecta,
  detenerlo inmediatamente y revisar DB_NAME y PORT.

No modificar directamente el estado ni desactivar claves
foráneas como solución a una restricción de negocio.

---

## 23. ACTUALIZACIONES Y CONTROL DE VERSIONES

### 23.1. Estado del repositorio

Desde la raíz:

```powershell
git status
```

Consultar cambios:

```powershell
git diff
```

### 23.2. Actualización de dependencias

Consultar versiones instaladas:

```powershell
npm ls --depth=0
```

Consultar posibles actualizaciones:

```powershell
npm outdated
```

Realizar una auditoría:

```powershell
npm audit
```

No ejecutar actualizaciones forzadas
sin evaluar compatibilidad y riesgos.

### 23.3. Actualización de versión

Desde backend o frontend,
según corresponda:

```powershell
npm version 0.3.0 --no-git-tag-version --ignore-scripts
```

Este comando deberá utilizarse
con la versión del incremento
que se esté preparando.

No deberá repetirse innecesariamente
si la versión ya es correcta.

### 23.4. Consistencia

Verificar la versión entre:

- Backend.
- Frontend.
- Archivos package.json.
- Archivos package-lock.json.
- Configuraciones de aplicación.
- Identificación visual.
- Documentación.

### 23.5. Actualización mediante ZIP

Cuando una actualización incluya
archivos completos:

1. Verificar el contenido del paquete.
2. Detener los servidores afectados.
3. Extraer el paquete.
4. Reemplazar únicamente los archivos indicados.
5. Conservar los archivos privados.
6. Reiniciar los servicios.
7. Ejecutar las pruebas correspondientes.

No deberá incorporarse un paquete ZIP
de actualización al repositorio
salvo que exista una finalidad
expresamente definida.

### 23.6. Revisión previa al commit

Verificar:

- Archivos modificados.
- Archivos nuevos.
- Archivos eliminados.
- Ausencia de credenciales.
- Ausencia de respaldos.
- Ausencia de compilaciones generadas.
- Documentación actualizada.
- Resultados de pruebas.
- CHECK integral.

### 23.7. Consolidación

El incremento deberá contar con
aprobación expresa antes de registrarse.

Mensaje histórico de referencia de HU-004:

```text
HU-004 - Gestion integral de torneos y Sistema de Diseno v0.2.0
```

HU-004 fue consolidada en el commit `27654c0`.

Mensaje propuesto para HU-005 (pendiente de aprobación):

```text
HU-005 - Gestion de ediciones v0.3.0
```

La selección de archivos deberá
realizarse de manera controlada.

Antes del commit comprobar:

```powershell
git diff --cached --stat
```

### 23.8. Publicación

La publicación se realizará sobre
la rama correspondiente.

Rama principal utilizada:

`master`

Después del commit aprobado:

```powershell
git push origin master
```

La publicación deberá verificarse
antes de considerar consolidado
el incremento.


### 23.9. Verificación de coherencia de versión

Desde la raíz del proyecto, en la cuarta terminal:

```powershell
node -e "for (const carpeta of ['backend','frontend']) { const p = require('./' + carpeta + '/package.json'); const l = require('./' + carpeta + '/package-lock.json'); console.log(carpeta + '/package.json: ' + p.version); console.log(carpeta + '/package-lock.json: ' + l.version); console.log(carpeta + '/package-lock.json (raiz): ' + l.packages[''].version); }"
Select-String -Path backend/src/config/app.config.js, frontend/src/config/app.config.js -Pattern "version:"
```

Durante la consolidación de HU-005 se verificaron los ocho
valores: todos corresponden a 0.3.0. Luego se reiniciaron
los servidores según 10.6. El cambio de versión no
modifica las reglas de negocio de los servicios.

---

## 24. SEGURIDAD OPERATIVA

### 24.1. Credenciales

No deberán publicarse:

- Archivos .env privados.
- Contraseñas.
- Secretos de sesión.
- Credenciales de MySQL.
- Respaldos.
- Hashes de contraseñas.

### 24.2. Entornos

Mantener diferenciados:

- Desarrollo principal.
- Pruebas aisladas.
- Restauración.
- Producción futura.

### 24.3. Operaciones destructivas

Toda operación destructiva deberá
identificar previamente:

- Base de datos.
- Entidad.
- Registro afectado.
- Dependencias.
- Consecuencias.
- Posibilidad de recuperación.

La confirmación de una operación
no reemplaza la validación
de integridad del backend.

### 24.4. Historial deportivo

Los registros históricos deberán
conservarse conforme al reglamento
y las políticas aprobadas.

No deberán eliminarse datos asociados
mediante operaciones en cascada
que comprometan dicha conservación.

### 24.5. Privacidad

Las futuras listas de buena fe
contendrán información personal.

Sus respaldos, consultas y accesos
deberán mantenerse restringidos.

Las publicaciones deportivas deberán
excluir información personal
que no resulte necesaria.

### 24.6. Dependencias

Las auditorías deberán realizarse
periódicamente.

La ausencia de vulnerabilidades
detectadas durante una auditoría
no constituye una garantía permanente.

### 24.7. Sesiones

Los registros de sesión deberán
tratarse como información sensible.

No deberán publicarse cookies,
identificadores ni secretos
de sesión.

### 24.8. Producción

Antes del despliegue deberán
evaluarse:

- HTTPS.
- Configuración de cookies.
- Privilegios de MySQL.
- Protección de credenciales.
- Respaldos periódicos.
- Recuperación ante incidentes.
- Monitoreo.
- Límites de solicitudes.
- Disponibilidad.
- Seguridad de infraestructura.

ALTO-SISTEMA todavía no se encuentra
desplegado en producción.

---

## 25. ESTADO OPERATIVO Y CONTROL FINAL

### 25.1. Registro histórico de v0.2.0

| Propiedad | Valor |
|---|---|
| ALTO-SISTEMA | 0.2.0 |
| Sistema de Diseño | 1.0 |
| Historia de usuario | HU-004 |
| Módulo incorporado | TORNEOS |
| Base principal | alto_sistema |
| Base de pruebas | altosistemahu004test |
| Puerto principal | 3000 |
| Puerto de pruebas | 3001 |
| Puerto frontend | 5173 |

### 25.2. Resultados automatizados históricos de HU-004

| Grupo | Resultado |
|---|---|
| Unitarias de autenticación | 13/13 |
| Unitarias de torneos | 30/30 |
| Integración de autenticación | 1/1 |
| Integración de torneos | 1/1 |
| Total de pruebas automatizadas | 45/45 |
| Pruebas fallidas | 0 |

La totalidad de las pruebas fue
superada mediante ejecuciones
separadas.

La integración de torneos contempla
20 controles internos previstos.

El resultado global de dicha prueba
fue satisfactorio.

### 25.3. Ejecuciones registradas de HU-004

| Ejecución | Totales | Aprobadas | Omitidas | Fallidas |
|---|---:|---:|---:|---:|
| Unitarias | 45 | 43 | 2 | 0 |
| Regresión con autenticación | 45 | 44 | 1 | 0 |
| Integración aislada de torneos | 1 | 1 | 0 | 0 |

### 25.4. Tiempos registrados de HU-004

| Operación | Duración |
|---|---:|
| Pruebas unitarias | 523,10 ms |
| Regresión con autenticación | 716,46 ms |
| Integración de torneos | 1414,30 ms |
| Compilación frontend | 3,49 s |

Los tiempos corresponden al entorno
local de desarrollo.

No constituyen mediciones de
rendimiento en producción.

### 25.5. Verificaciones complementarias de HU-004

| Control | Resultado |
|---|---|
| ESLint: errores | 0 |
| ESLint: advertencias | 0 |
| Compilación de producción | Exitosa |
| Migraciones registradas | 2 |
| Migraciones pendientes | 0 |
| Integridad de migraciones | Verificada |
| Revisión visual inicial | 8/8 |
| Validación funcional | Satisfactoria |
| Eliminación definitiva | Verificada |
| Cancelación de eliminación | Verificada |
| Limpieza de registros temporales | Completada |
| Sistema de Diseño v1.0 | Verificado |

### 25.6. Mantenimiento periódico recomendado

- Verificar disponibilidad de los servicios.
- Revisar errores operativos.
- Generar respaldos.
- Comprobar restauraciones.
- Auditar dependencias.
- Revisar cambios pendientes en Git.
- Verificar la seguridad de credenciales.
- Comprobar integridad de migraciones.
- Actualizar la documentación.

### 25.7. Verificaciones pendientes

- Restauración de respaldos que incluyan torneos y ediciones.
- Automatización de respaldos.
- Conservación de copias externas.
- Pruebas de rendimiento y carga.
- Pruebas automatizadas del frontend.
- Auditoría formal de accesibilidad.
- Validación en dispositivos móviles físicos.
- Verificación de nuevas claves foráneas al implementar otras entidades (torneos–ediciones ya verificada).
- Optimización de recursos tipográficos.
- Evaluación de seguridad de producción.
- Despliegue en producción.

### 25.8. Lista de cierre de HU-004

- [x] Backend implementado.
- [x] Frontend implementado.
- [x] Sistema de Diseño incorporado.
- [x] Gestión integral de torneos.
- [x] Eliminación definitiva.
- [x] Pruebas unitarias: 43/43.
- [x] Pruebas de integración: 2/2.
- [x] Regresión satisfactoria.
- [x] ESLint satisfactorio.
- [x] Compilación exitosa.
- [x] Integridad de migraciones.
- [x] Validación funcional.
- [x] Limpieza de registros temporales.
- [x] Actualización a v0.2.0.
- [x] Consolidación documental.
- [x] Capturas oficiales.
- [x] CHECK integral aprobado.
- [x] Commit registrado.
- [x] Publicación en GitHub.

La versión 0.2.0 fue aprobada y consolidada en Git
(commit `27654c0`), antes de iniciar HU-005.


### 25.9. Estado operativo actual — v0.3.0

| Propiedad | Valor |
|---|---|
| ALTO-SISTEMA | 0.3.0 |
| Sistema de Diseño | 1.0 |
| Historia de usuario | HU-005 |
| Módulos deportivos implementados | TORNEOS y EDICIONES |
| Base principal | alto_sistema |
| Base aislada de integración | altosistemahu004test |
| Base aislada de instalación | altosistemahu005fresh |
| Puerto principal | 3000 |
| Puerto aislado | 3001 (servidor detenido tras las pruebas) |
| Puerto frontend | 5173 |
| Última versión consolidada | v0.2.0 |

### 25.10. Resultados de HU-005

| Grupo | Resultado |
|---|---:|
| Unitarias de autenticación | 13/13 |
| Unitarias de torneos | 30/30 |
| Unitarias de ediciones | 59/59 |
| Total unitarias | 102/102 |
| Integración de autenticación | 1/1 |
| Integración de torneos | 1/1 |
| Integración de ediciones | 1/1 |
| Total pruebas automatizadas | 105/105 |
| Fallidas, canceladas u omitidas en las ejecuciones específicas | 0 |

| Ejecución específica | Duración total |
|---|---:|
| Unitarias de ediciones | 445,5618 ms |
| Regresión de servicios auth y torneo | 302,3158 ms |
| Integración de ediciones | 1860,0626 ms |
| Integración de torneos | 1394,3234 ms |
| Integración de autenticación | 503,2238 ms |
| Compilación frontend | 2,52 s |

Las ejecuciones fueron separadas. Los controles internos
no se suman como pruebas adicionales. Las duraciones
corresponden al entorno de desarrollo, no a producción.

| Verificación complementaria | Resultado |
|---|---|
| ESLint | Sin errores informados |
| Compilación | Exitosa |
| Migraciones principal y prueba | 3 registradas, 0 pendientes |
| Instalación desde cero e idempotencia | Verificadas |
| Integridad referencial torneos–ediciones | Verificada |
| Controles funcionales y responsive | 17/17, confirmados durante el desarrollo |
| Registros temporales principales | Eliminados |
| Respaldo previo a HU-005 | Generado y tamaño confirmado |
| Restauración de respaldo v0.3.0 | Pendiente |
| Coherencia de versiones | 8/8 |
| Reinicio controlado | Completado |

### 25.11. Lista de cierre de HU-005

- [x] Backend y frontend de EDICIONES implementados.
- [x] Migración 003 aplicada y verificada.
- [x] Integridad referencial efectiva.
- [x] Instalación desde cero e idempotencia.
- [x] Pruebas unitarias: 102/102.
- [x] Pruebas de integración: 3/3.
- [x] Regresión, lint y compilación satisfactorios.
- [x] Verificación funcional y responsive: 17/17.
- [x] Limpieza de registros temporales.
- [x] Actualización a v0.3.0 y coherencia de versiones.
- [x] Reinicio del backend y frontend principales.
- [x] Detención del backend aislado y conservación de bases.
- [ ] Consolidación documental completa.
- [ ] Capturas oficiales de v0.3.0.
- [ ] CHECK integral aprobado.
- [ ] Commit registrado.
- [ ] Publicación en GitHub.

La implementación de HU-005 se encuentra técnica y
funcionalmente verificada. El cierre formal permanece
pendiente. No se deberá avanzar hacia HU-006 antes de
aprobar y consolidar este incremento.

Se mantienen las limitaciones de restauración, pruebas
físicas móviles, accesibilidad, carga y seguridad de
producción. No se han realizado pruebas nuevas por el
solo hecho de actualizar este manual.

---

**ALTO-SISTEMA**

Sistema integral de gestión deportiva.
