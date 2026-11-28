
# ALTO-SISTEMA — Manual de mantenimiento

Versión de referencia: 0.2.0

Entorno principal: Windows 11.

Estado: implementación técnica y funcional verificada.
Pendiente de consolidación definitiva de HU-004.

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
| ALTO-SISTEMA | 0.2.0 |
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
de integración de torneos.

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
└── 002_torneos.sql
```

### 7.2. Migraciones disponibles

| Versión | Archivo | Responsabilidad |
|---|---|---|
| 001 | 001_usuarios.sql | Usuarios administrativos |
| 002 | 002_torneos.sql | Registro de torneos |

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

La versión 0.2.0 registra dos
migraciones aplicadas.

### 7.6. Resultado esperado

```text
================================
ALTO-SISTEMA v0.2.0
MIGRACIONES DE BASE DE DATOS
================================
Base de datos: alto_sistema
Registradas: 2
Pendientes: 0
================================
BASE DE DATOS ACTUALIZADA
================================
```

Este resultado corresponde al estado
verificado durante el cierre de HU-004.

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

Las futuras relaciones entre torneos
y ediciones deberán incorporar
restricciones de integridad adecuadas.

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

### 12.9. Dependencias futuras

Cuando se incorporen ediciones y
otras entidades deportivas, sus
relaciones deberán impedir
eliminaciones incompatibles con
la conservación del historial.

Ante una dependencia que impida
eliminar, el administrador deberá
considerar el archivado.

El backend contempla el tratamiento
de errores de integridad referencial.

La existencia y verificación real
de claves foráneas dependientes
corresponderá a futuras historias
de usuario.

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

### 14.2. Resultado esperado en v0.2.0

```text
tests 45
pass 43
fail 0
skipped 2
```

### 14.3. Distribución

| Grupo | Pruebas |
|---|---:|
| Unitarias de autenticación | 13 |
| Unitarias de torneos | 30 |
| Total de pruebas unitarias | 43 |
| Integraciones opcionales | 2 |
| Total general | 45 |

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

    npm test
} finally {
    Remove-Item Env:ALTO_TEST_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:ALTO_TEST_USER -ErrorAction SilentlyContinue
    Remove-Item Env:ALTO_INTEGRATION_TEST -ErrorAction SilentlyContinue
    Remove-Variable clave -ErrorAction SilentlyContinue
}
```

### 15.3. Resultado esperado

```text
tests 45
pass 44
fail 0
skipped 1
```

La prueba omitida corresponde
a la integración aislada de torneos.

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
| Base de pruebas | altosistemahu004test |
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

Nunca ejecutar la integración de torneos
contra la base alto_sistema.

No modificar el archivo .env principal
para habilitar estas pruebas.

No utilizar nombres de competiciones
reales como registros temporales.

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

Los tres botones administrativos
de una tarjeta de torneo deberán
mantenerse accesibles y correctamente
distribuidos en pantallas pequeñas.

### 18.6. Limitaciones

La simulación de dispositivos móviles
mediante el navegador no sustituye
las pruebas en dispositivos físicos.

Una compilación exitosa tampoco
garantiza por sí sola la ausencia
de errores funcionales.

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

La restauración de un respaldo que
incluya la nueva tabla torneos
permanece pendiente de verificación.

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
npm version 0.2.0 --no-git-tag-version --ignore-scripts
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

Mensaje previsto para HU-004:

```text
HU-004 - Gestion integral de torneos y Sistema de Diseno v0.2.0
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

### 25.1. Versión actual

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

### 25.2. Resultados automatizados

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

### 25.3. Ejecuciones registradas

| Ejecución | Totales | Aprobadas | Omitidas | Fallidas |
|---|---:|---:|---:|---:|
| Unitarias | 45 | 43 | 2 | 0 |
| Regresión con autenticación | 45 | 44 | 1 | 0 |
| Integración aislada de torneos | 1 | 1 | 0 | 0 |

### 25.4. Tiempos registrados

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

### 25.5. Verificaciones complementarias

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

- Restauración de respaldo con la tabla torneos.
- Automatización de respaldos.
- Conservación de copias externas.
- Pruebas de rendimiento y carga.
- Pruebas automatizadas del frontend.
- Auditoría formal de accesibilidad.
- Validación en dispositivos móviles físicos.
- Verificación real de futuras claves foráneas.
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
- [ ] Consolidación documental.
- [ ] Capturas oficiales.
- [ ] CHECK integral aprobado.
- [ ] Commit registrado.
- [ ] Publicación en GitHub.

La versión 0.2.0 se encuentra
técnicamente y funcionalmente verificada.

La consolidación definitiva deberá
completarse conforme a las normas
de desarrollo establecidas.

---

**ALTO-SISTEMA**

Sistema integral de gestión deportiva.
