# ALTO-SISTEMA — Manual de mantenimiento

Versión de referencia: 0.4.0

Entorno principal: Windows 11.

Estado: HU-004 y HU-005 aprobadas y consolidadas.
HU-006 implementada y verificada.
Pendiente de verificaciones finales, CHECK integral
y publicación definitiva.

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
- Administración de torneos.
- Administración de ediciones.
- Administración de categorías.
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

| Herramienta | Versión de referencia |
|---|---|
| Node.js | 24.20.0 |
| npm | 11.19.0 |
| MySQL | 8.0.45 |
| Git | 2.55.0 para Windows |
| Vite | 8.4.0 |
| ALTO-SISTEMA | 0.4.0 |
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
│   └── migrations/
├── docs/
│   └── capturas/
├── frontend/
├── .gitignore
└── README.md
```

### 3.2. Responsabilidades

| Directorio | Responsabilidad |
|---|---|
| backend | API REST y lógica de negocio |
| database | Migraciones SQL |
| docs | Documentación técnica y evidencias |
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

### 3.4. Edición de archivos

Los archivos de código y documentación
deberán modificarse directamente desde
el editor de VS Code.

Cuando se necesite compartir un archivo
existente, se utilizará preferentemente
su ubicación dentro del árbol del proyecto.

La terminal se reservará para operaciones
de ejecución, instalación, diagnóstico,
pruebas, mantenimiento y Git.

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

### 5.5. Verificación de la base seleccionada

Antes de realizar operaciones de mantenimiento:

```sql
SELECT DATABASE();
```

El resultado deberá corresponder
a la base que se desea administrar.

No deberán realizarse modificaciones
si la base seleccionada no es la prevista.

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
de integración deportivas.

Las pruebas de TORNEOS, EDICIONES y CATEGORÍAS
deberán utilizar el entorno aislado correspondiente.

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
├── 003_ediciones.sql
└── 004_categorias.sql
```

### 7.2. Migraciones disponibles

| Versión | Archivo | Responsabilidad |
|---|---|---|
| 001 | 001_usuarios.sql | Usuarios administrativos |
| 002 | 002_torneos.sql | Registro de torneos |
| 003 | 003_ediciones.sql | Ediciones de cada torneo |
| 004 | 004_categorias.sql | Categorías de cada edición |

### 7.3. Ejecución

Desde el directorio backend:

```powershell
npm run migrate
```

Antes de realizar una migración estructural
sobre una base existente, deberá generarse
un respaldo preventivo y detenerse
las escrituras correspondientes.

### 7.4. Controles del migrador

- Orden de ejecución.
- Registro de migraciones.
- Verificación de checksums.
- Control de ejecución concurrente.
- Verificación estructural.
- Detección de migraciones incompletas.
- Identificación de migraciones pendientes.

Cada nueva migración deberá disponer
de su verificador estructural.

### 7.5. Idempotencia

La ejecución repetida del migrador
no deberá duplicar migraciones
previamente aplicadas.

| Versión | Migraciones |
|---|---:|
| 0.2.0 | 2 |
| 0.3.0 | 3 |
| 0.4.0 | 4 |

La instalación limpia y la idempotencia
de las cuatro migraciones deberán
verificarse durante el cierre de HU-006.

### 7.6. Resultado esperado en v0.4.0

```text
================================
ALTO-SISTEMA v0.4.0
MIGRACIONES DE BASE DE DATOS
================================
Base de datos: alto_sistema
Registradas: 4
Pendientes: 0
================================
BASE DE DATOS ACTUALIZADA
================================
```

El ejemplo representa el resultado esperado
de una ejecución sobre una base actualizada.

La migración 004 ya fue aplicada en la base
principal y en la base aislada de integración.

La ejecución final de idempotencia
permanece pendiente de confirmación.

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
definitiva en HU-004 no requirió
una nueva migración.

Las migraciones 001 y 002 permanecieron
sin modificaciones.

La migración 003 incorpora la relación
restrictiva entre torneos y ediciones.

La migración 004 incorpora la relación
restrictiva entre ediciones y categorías.

### 7.9. Migración 003 — EDICIONES

En una instalación que ya posee
las migraciones 001 y 002, la migración 003
incorpora la estructura de EDICIONES.

Verificación de solo lectura:

```sql
SELECT DATABASE();
SHOW CREATE TABLE ediciones;
SHOW INDEX FROM ediciones;
```

Estructura:

| Elemento | Definición |
|---|---|
| id | INT autoincremental, PK |
| torneo_id | INT NOT NULL, FK a torneos.id |
| nombre | VARCHAR(100) NOT NULL |
| descripcion | VARCHAR(500), nullable |
| fecha_inicio | DATE, nullable |
| fecha_finalizacion | DATE, nullable |
| estado | ENUM PLANIFICADA, EN_CURSO, FINALIZADA |
| Estado inicial | PLANIFICADA |
| fecha_creacion | TIMESTAMP, default CURRENT_TIMESTAMP |
| fecha_actualizacion | TIMESTAMP, actualización automática |
| uq_ediciones_torneo_nombre | UNIQUE (torneo_id, nombre) |
| idx_ediciones_torneo_estado | Índice (torneo_id, estado) |
| fk_ediciones_torneo | ON DELETE RESTRICT y ON UPDATE RESTRICT |
| chk_ediciones_fechas | Si ambas fechas existen, finalización >= inicio |

Motor InnoDB, utf8mb4 e intercalación
utf8mb4_unicode_ci.

La instalación limpia de las primeras
tres migraciones fue verificada en HU-005.

### 7.10. Migración 004 — CATEGORÍAS

La migración 004 incorpora el tercer nivel
de la arquitectura multitorneo.

En una base con las migraciones 001 a 003,
se espera una migración pendiente.

Ejecutar desde backend:

```powershell
npm run migrate
```

La actualización no requiere eliminar
ni recrear la base existente.

Verificación estructural:

```sql
SELECT DATABASE();
SHOW CREATE TABLE categorias;
SHOW INDEX FROM categorias;
```

Estructura:

| Elemento | Definición |
|---|---|
| id | INT autoincremental, PK |
| edicion_id | INT NOT NULL, FK a ediciones.id |
| nombre | VARCHAR(100) NOT NULL |
| descripcion | VARCHAR(500), nullable |
| estado | ENUM ACTIVA, ARCHIVADA |
| Estado inicial | ACTIVA |
| fecha_creacion | TIMESTAMP, default CURRENT_TIMESTAMP |
| fecha_actualizacion | TIMESTAMP, actualización automática |
| uq_categorias_edicion_nombre | UNIQUE (edicion_id, nombre) |
| idx_categorias_edicion_estado | Índice (edicion_id, estado) |
| fk_categorias_edicion | ON DELETE RESTRICT y ON UPDATE RESTRICT |

Motor InnoDB, utf8mb4 e intercalación
utf8mb4_unicode_ci.

La migración fue aplicada satisfactoriamente en:

- alto_sistema.
- altosistemahu004test.

### 7.11. Verificación de integridad jerárquica

Consultar posibles ediciones huérfanas:

```sql
SELECT COUNT(*) AS ediciones_huerfanas
FROM ediciones e
LEFT JOIN torneos t ON t.id = e.torneo_id
WHERE t.id IS NULL;
```

Consultar posibles categorías huérfanas:

```sql
SELECT COUNT(*) AS categorias_huerfanas
FROM categorias c
LEFT JOIN ediciones e ON e.id = c.edicion_id
WHERE e.id IS NULL;
```

Resultado esperado en ambos casos:

```text
0
```

Estas consultas son de solo lectura.

No deberán ejecutarse sobre respaldos
que todavía no posean las tablas
correspondientes.

### 7.12. Diagnóstico de migraciones sin verificador

Durante la primera ejecución de HU-006,
el migrador rechazó la migración 004
debido a la ausencia de su verificador
estructural correspondiente.

Se actualizó `backend/src/migrate.js`
y se repitió la operación.

La migración fue aplicada satisfactoriamente.

Ante un problema similar:

1. Identificar la migración rechazada.
2. Revisar el registro de verificadores.
3. Comprobar el estado real de la tabla.
4. Incorporar el verificador correspondiente.
5. Ejecutar nuevamente el migrador.
6. Confirmar el resultado estructural.

No deberán alterarse las migraciones
ya aplicadas ni registrarse manualmente
como exitosas para evitar el error.

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

La contraseña deberá cumplir las
validaciones del sistema.

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
- Disponibilidad de sesiones.
- Inicio correcto del frontend.
- Pantalla de acceso privado.
- Autenticación.
- Visualización del Dashboard.
- Disponibilidad del módulo TORNEOS.
- Acceso a EDICIONES.
- Acceso a CATEGORÍAS, cuando exista una edición.
- Identificación correcta de versión.

### 9.7. Resultado confirmado de v0.4.0

El backend principal inició correctamente:

```text
================================
ALTO-SISTEMA v0.4.0
Servidor: http://127.0.0.1:3000
Entorno: development
Base de datos: ONLINE
Sesiones MySQL: ONLINE
Autenticacion: HABILITADA
Modulo de torneos: HABILITADO
Modulo de ediciones: HABILITADO
Modulo de categorias: HABILITADO
================================
```

El frontend inició correctamente:

```text
frontend@0.4.0 dev

VITE v8.4.0 ready in 327 ms

Local: http://localhost:5173/
```

El tiempo registrado corresponde
a esa ejecución local y podrá variar.

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

Para instalar una actualización:

1. Identificar los archivos afectados.
2. Detener los procesos cuando corresponda.
3. Reemplazar únicamente los archivos indicados.
4. Conservar la configuración privada.
5. Reiniciar los procesos afectados.
6. Ejecutar las pruebas necesarias.

La modalidad preferente de entrega
es código completo directamente
en la conversación.

Los paquetes ZIP podrán utilizarse
cuando hayan sido solicitados
o exista una necesidad justificada.

No deberán reemplazarse carpetas
completas cuando la actualización
solamente incluya algunos archivos.

### 10.6. Reinicio controlado de v0.4.0

1. Terminal 1: detener y reiniciar el backend.
2. Verificar versión 0.4.0 y puerto 3000.
3. Confirmar conexión con MySQL y sesiones.
4. Confirmar autenticación y los tres módulos deportivos.
5. Terminal 2: detener y reiniciar el frontend.
6. Actualizar el navegador.
7. Verificar la identificación visual de versión.
8. Detener el backend aislado cuando ya no se necesite.
9. Mantener disponible la cuarta terminal.

El cierre del proceso de pruebas
no elimina sus datos ni requiere
detener MySQL.

### 10.7. Actualizaciones exclusivamente documentales

No será necesario reiniciar servidores
cuando se modifiquen únicamente
archivos Markdown.

Las modificaciones de React y CSS
podrán aprovechar la actualización
automática de Vite.

Los cambios en archivos del backend
deberán incorporarse al proceso
mediante un reinicio cuando corresponda.

---

## 11. VERIFICACIÓN DE DISPONIBILIDAD

### 11.1. Backend

La disponibilidad deberá comprobarse
mediante:

- Mensajes de inicio.
- Conexión con MySQL.
- Endpoint de disponibilidad.
- Respuestas de la API REST.

Endpoint de disponibilidad:

http://localhost:3000/api/health

Desde PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health"
```

La consulta no deberá contener
credenciales privadas.

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

TORNEOS incorpora indicadores
de ediciones totales y en curso.

EDICIONES incorpora indicadores
de categorías totales y activas.

CATEGORÍAS muestra los indicadores
totales, activos y archivados
de su edición correspondiente.

Las consultas fallidas no deberán
representarse mediante estadísticas
ficticias.

Un guion indica que el valor
no se encuentra disponible.

El cero representa una cantidad real.

### 11.4. Sesiones

La verificación deberá contemplar:

- Inicio de sesión.
- Acceso a rutas privadas.
- Persistencia de sesión.
- Cierre de sesión.
- Rechazo de solicitudes no autenticadas.

---

## 12. ADMINISTRACIÓN DE COMPETICIONES

### 12.1. Acceso a TORNEOS

Ingresar a ALTO-SISTEMA mediante
una sesión autenticada.

Seleccionar TORNEOS desde el menú
lateral o el acceso correspondiente.

### 12.2. Creación de torneos

Seleccionar NUEVO TORNEO.

Completar:

- Nombre obligatorio.
- Descripción opcional.

Guardar los datos.

Los nombres duplicados serán rechazados.

Todo torneo nuevo se registra inicialmente
con estado ACTIVO.

### 12.3. Edición de torneos

Seleccionar EDITAR sobre el torneo
correspondiente.

Modificar el nombre o la descripción.

Guardar los cambios.

### 12.4. Archivado de torneos

Seleccionar ARCHIVAR.

Confirmar la operación.

El torneo permanecerá registrado en MySQL
con estado ARCHIVADO.

El archivado conserva la identidad,
los datos y las entidades asociadas.

### 12.5. Reactivación de torneos

Seleccionar REACTIVAR sobre un
torneo archivado.

Confirmar la operación.

El torneo recuperará el estado ACTIVO.

### 12.6. Eliminación definitiva de torneos

Seleccionar ELIMINAR.

La interfaz solicitará confirmación
e identificará el registro afectado.

Si el administrador confirma y el backend
autoriza la operación, el registro será
retirado físicamente de MySQL.

La operación está disponible para
torneos activos y archivados sin
dependencias incompatibles.

No existe una papelera de recuperación.

### 12.7. Cancelación de eliminación

Seleccionar Cancelar en la confirmación.

Resultado esperado:

- El registro permanece disponible.
- No se modifica su estado.
- No se modifica su descripción.
- No se alteran los indicadores.
- No se envía una solicitud DELETE.

### 12.8. Reutilización de nombres

Un torneo archivado conserva
la reserva de su nombre.

Un torneo eliminado libera su nombre
para una creación posterior.

Crear nuevamente un torneo con
el mismo nombre no recupera
el registro eliminado.

### 12.9. Dependencias de torneos

Desde v0.3.0, un torneo con ediciones
asociadas no puede eliminarse.

La restricción se aplica tanto
a torneos activos como archivados.

La API devuelve HTTP 409.

Mensaje histórico verificado:

> No se puede eliminar el torneo porque tiene registros asociados. Podés archivarlo.

Ante una dependencia, deberá conservarse
o archivarse el torneo correspondiente.

No eliminar información histórica
solamente para permitir el borrado.

### 12.10. Comparación administrativa

| Operación | Conserva datos | Reversible desde la aplicación |
|---|---|---|
| EDITAR | Conserva la identidad | Mediante nueva edición de datos |
| ARCHIVAR | Sí | Sí |
| REACTIVAR | Sí | Sí |
| ELIMINAR | No | No |

### 12.11. Recomendaciones

Utilizar el archivado para conservar
competiciones que ya no se encuentren
administrativamente activas.

Utilizar la eliminación para registros
accidentales, pruebas o competiciones
que puedan retirarse sin comprometer
información asociada.

Antes de confirmar una eliminación,
verificar el registro seleccionado.

Cuando los datos sean importantes,
deberá existir un respaldo apropiado.

### 12.12. Administración de EDICIONES

Desde TORNEOS, seleccionar
GESTIONAR EDICIONES.

No existe una entrada independiente
en el menú lateral.

Cada tarjeta de torneo muestra:

- Total de ediciones.
- Ediciones en curso.

La pantalla EDICIONES permite:

- Consultar indicadores.
- Buscar por nombre o descripción.
- Filtrar por estado.
- Crear ediciones.
- Editar datos.
- Administrar estados.
- Eliminar registros sin dependencias.
- Regresar a TORNEOS.

Campos:

| Campo | Condición |
|---|---|
| Nombre | Obligatorio, hasta 100 caracteres |
| Descripción | Opcional, hasta 500 caracteres |
| Fecha de inicio | Opcional |
| Fecha de finalización | Opcional |

No existe un campo independiente
para el año.

El nombre puede incluirlo libremente.

Ejemplo: NOCTURNO 2027.

El nombre debe ser único dentro
del torneo correspondiente.

Las fechas pueden modificarse o quitarse.

Si ambas existen, la fecha de finalización
no puede ser anterior a la fecha de inicio.

### 12.13. Estados de EDICIONES

| Acción | Estado de origen | Resultado |
|---|---|---|
| Crear | — | PLANIFICADA |
| Iniciar | PLANIFICADA | EN_CURSO |
| Finalizar | EN_CURSO | FINALIZADA |
| Reabrir | FINALIZADA | EN_CURSO |
| Editar | Cualquiera | Conserva el estado |
| Eliminar | Cualquiera | Eliminación sin dependencias |

Las fechas no cambian automáticamente
los estados deportivos.

Se permiten múltiples ediciones
en curso simultáneamente.

Las transiciones y eliminaciones
requieren confirmación desde la interfaz.

### 12.14. EDICIONES de torneos archivados

| Operación | Torneo ACTIVO | Torneo ARCHIVADO |
|---|---|---|
| Consultar y filtrar | Sí | Sí |
| Crear | Sí | No |
| Editar datos y fechas | Sí | Sí |
| Iniciar | Sí | No |
| Finalizar edición en curso | Sí | Sí |
| Reabrir | Sí | No |
| Eliminar sin dependencias | Sí | Sí |

Archivar el torneo no finaliza
automáticamente sus ediciones.

Para iniciar o reabrir una edición,
reactivar previamente el torneo,
cuando corresponda.

### 12.15. Dependencias de categorías

Desde v0.4.0, una edición con categorías
asociadas no puede eliminarse.

La protección se aplica a ediciones:

- PLANIFICADAS.
- EN_CURSO.
- FINALIZADAS.

No depende del estado administrativo
de las categorías asociadas.

Una categoría archivada continúa
constituyendo una dependencia.

La API responde HTTP 409 ante
una eliminación incompatible.

Esta protección fue verificada
contra MySQL y desde la interfaz.

### 12.16. Administración de CATEGORÍAS

Desde TORNEOS:

```text
TORNEOS
    ↓
GESTIONAR EDICIONES
    ↓
GESTIONAR CATEGORÍAS
```

Cada tarjeta de edición incorpora:

- Indicador CATEGORÍAS.
- Indicador ACTIVAS.
- Botón GESTIONAR CATEGORÍAS.

La pantalla de categorías identifica
el torneo y la edición correspondientes.

No existe una opción independiente
en el menú lateral.

### 12.17. Creación de categorías

Seleccionar NUEVA CATEGORÍA.

Completar:

| Campo | Condición |
|---|---|
| Nombre | Obligatorio, hasta 100 caracteres |
| Descripción | Opcional, hasta 500 caracteres |

Guardar los datos.

Toda categoría nueva se registra
con estado ACTIVA.

No existen categorías predeterminadas.

Ejemplos de nombres configurables:

- LIBRE.
- SENIOR.
- FEMENINO.

Los nombres no determinan automáticamente
las reglas de edad ni el formato deportivo.

La creación requiere:

- Torneo ACTIVO.
- Edición PLANIFICADA o EN_CURSO.

### 12.18. Unicidad de categorías

Una categoría debe tener un nombre
único dentro de su edición.

Se permiten nombres iguales en
ediciones diferentes.

Ejemplo:

| Edición | Categoría | Resultado |
|---|---|---|
| NOCTURNO 2027 | LIBRE | Permitido |
| NOCTURNO 2027 | SENIOR | Permitido |
| NOCTURNO 2028 | LIBRE | Permitido |
| NOCTURNO 2027 | libre | Duplicado |

La unicidad no distingue mayúsculas
ni acentos según la intercalación
establecida en MySQL.

Una categoría archivada conserva
la reserva de su nombre.

### 12.19. Edición de categorías

Seleccionar EDITAR.

Modificar:

- Nombre.
- Descripción.

Guardar los cambios.

La categoría conserva:

- Identificador.
- Edición asociada.
- Estado administrativo.

No se permite trasladar una categoría
a otra edición mediante su modificación.

### 12.20. Archivado de categorías

Seleccionar ARCHIVAR.

Confirmar la operación.

La categoría pasará a ARCHIVADA.

Se conservan su identidad, nombre,
descripción y relación con la edición.

El archivado está permitido incluso
si el torneo se encuentra archivado
o la edición finalizada.

### 12.21. Reactivación de categorías

Seleccionar REACTIVAR.

Confirmar la operación.

La categoría recuperará el estado ACTIVA.

La reactivación requiere:

- Torneo ACTIVO.
- Edición PLANIFICADA o EN_CURSO.

Si alguna condición no se cumple,
la operación estará bloqueada.

### 12.22. Eliminación de categorías

Seleccionar ELIMINAR.

Verificar el nombre de la categoría
y su contexto deportivo.

Confirmar la operación.

La eliminación definitiva:

- Retira físicamente el registro de MySQL.
- Libera el nombre dentro de la edición.
- Actualiza los indicadores correspondientes.
- No elimina categorías de otras ediciones.
- No puede revertirse desde la aplicación.

La operación está disponible para
categorías activas y archivadas,
siempre que no existan dependencias
que impidan su eliminación.

Las entidades deportivas dependientes
de categorías se incorporarán posteriormente.

### 12.23. Restricciones administrativas de categorías

| Operación | Torneo activo y edición habilitada | Torneo archivado o edición finalizada |
|---|---|---|
| Consultar | Sí | Sí |
| Buscar y filtrar | Sí | Sí |
| Crear | Sí | No |
| Editar | Sí | Sí |
| Archivar | Sí | Sí |
| Reactivar | Sí | No |
| Eliminar sin dependencias | Sí | Sí |

Una edición habilitada corresponde
a PLANIFICADA o EN_CURSO.

La pantalla permanece disponible
en contextos restringidos.

Las restricciones afectan determinadas
operaciones, no el acceso completo
a la información.

### 12.24. Independencia de estados

Archivar un torneo no archiva
automáticamente sus categorías.

Finalizar una edición no archiva
automáticamente sus categorías.

Reactivar un torneo o reabrir una edición
no reactiva categorías archivadas.

Cada nivel conserva su propio estado.

### 12.25. Búsqueda e indicadores de categorías

La pantalla permite buscar
por nombre y descripción.

Filtros:

- Todas.
- Activas.
- Archivadas.

Indicadores:

- Total.
- Activas.
- Archivadas.

Los indicadores representan
el conjunto completo de categorías,
independientemente de los filtros.

Al regresar a EDICIONES se actualizan
los indicadores correspondientes
a cada tarjeta.

### 12.26. Orden de eliminación

Para retirar un contexto temporal completo:

```text
CATEGORÍAS
    ↓
EDICIONES
    ↓
TORNEO
```

Primero deberán eliminarse
las categorías temporales.

Después podrán eliminarse
las ediciones vacías.

Finalmente podrá eliminarse
el torneo sin ediciones.

Este procedimiento no autoriza
la eliminación de información
deportiva real o histórica.

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

Todos los endpoints deportivos
requieren autenticación.

### 13.2. Códigos HTTP

| Código | Interpretación |
|---|---|
| 200 | Operación exitosa |
| 201 | Registro creado |
| 400 | Solicitud inválida |
| 401 | Sesión no válida |
| 403 | Operación no permitida |
| 404 | Registro inexistente o fuera de contexto |
| 409 | Conflicto de datos, restricciones o dependencias |
| 500 | Error interno |
| 503 | Servicio no disponible |

### 13.3. Errores de eliminación

| Situación | Acción recomendada |
|---|---|
| Identificador inválido | Revisar la solicitud |
| Sesión expirada | Iniciar sesión nuevamente |
| Origen rechazado | Revisar configuración |
| Registro inexistente | Actualizar el listado |
| Dependencias | Conservar o archivar cuando corresponda |
| Error interno | Revisar registros del backend |

No deberán deshabilitarse los controles
de autenticación, origen o integridad
para evitar estos errores.

### 13.4. Respuesta de eliminación de torneos

```json
{
    "mensaje": "Torneo eliminado correctamente."
}
```

La interfaz solamente deberá interpretar
la eliminación como exitosa después
de recibir una respuesta satisfactoria.

### 13.5. Endpoints de EDICIONES

Ruta base:

`/api/torneos/:torneoId/ediciones`

| Método | Ruta relativa | Operación |
|---|---|---|
| GET | / | Listado e indicadores |
| GET | /:edicionId | Consulta individual |
| POST | / | Creación |
| PUT | /:edicionId | Edición de datos |
| PATCH | /:edicionId/estado | Cambio de estado |
| DELETE | /:edicionId | Eliminación |

El listado admite los filtros
`busqueda` y `estado`.

El estado no debe enviarse
en el cuerpo de creación
o edición de datos.

Utilizar PATCH de estado
para las transiciones.

### 13.6. Diagnóstico de EDICIONES

| Código | Situación posible | Acción |
|---|---|---|
| 400 | Datos, identificadores o fechas inválidos | Revisar campos |
| 401 | Sesión inválida | Autenticarse |
| 403 | Origen no permitido | Revisar configuración |
| 404 | Contexto inexistente o incorrecto | Revisar ruta |
| 409 | Duplicado, dependencia o transición incompatible | Revisar datos y estado |
| 500 | Error inesperado | Revisar backend |

El servicio utiliza transacciones
y bloqueo del torneo para las escrituras.

Ante un conflicto concurrente,
actualizar los datos antes de reintentar.

Respuesta de eliminación:

```json
{
    "mensaje": "Edición eliminada correctamente."
}
```

### 13.7. Endpoints de CATEGORÍAS

Ruta base:

`/api/torneos/:torneoId/ediciones/:edicionId/categorias`

| Método | Ruta relativa | Operación |
|---|---|---|
| GET | / | Listado e indicadores |
| GET | /:categoriaId | Consulta individual |
| POST | / | Creación |
| PUT | /:categoriaId | Actualización |
| PATCH | /:categoriaId/estado | Cambio de estado |
| DELETE | /:categoriaId | Eliminación |

Los seis endpoints requieren autenticación.

Las escrituras respetan los controles
de origen del servidor.

El listado admite:

- busqueda.
- estado.

### 13.8. Contrato de creación y edición

Ejemplo de creación:

```json
{
    "nombre": "LIBRE",
    "descripcion": "Categoría libre"
}
```

El estado inicial será ACTIVA.

La actualización admite únicamente:

- nombre.
- descripcion.

Ejemplo de actualización parcial:

```json
{
    "descripcion": "Nueva descripción"
}
```

La edición asociada no puede modificarse.

### 13.9. Cambio de estado

Ejemplo:

```json
{
    "estado": "ARCHIVADA"
}
```

Valores admitidos:

- ACTIVA.
- ARCHIVADA.

Repetir el estado vigente
no requiere una nueva escritura.

### 13.10. Respuesta de listado

Ejemplo ilustrativo:

```json
{
    "torneo": {
        "id": 1,
        "nombre": "NOCTURNO",
        "estado": "ACTIVO"
    },
    "edicion": {
        "id": 1,
        "torneo_id": 1,
        "nombre": "NOCTURNO 2027",
        "estado": "PLANIFICADA"
    },
    "categorias": [],
    "total": 0,
    "indicadores": {
        "total": 0,
        "activas": 0,
        "archivadas": 0
    }
}
```

El total del listado representa
la cantidad de resultados obtenidos.

Los indicadores representan
todas las categorías de la edición.

### 13.11. Diagnóstico de CATEGORÍAS

| Código | Situación | Acción recomendada |
|---|---|---|
| 400 | Datos o identificadores inválidos | Revisar solicitud |
| 401 | Sesión no válida | Iniciar sesión |
| 403 | Origen rechazado | Revisar FRONTEND_URL |
| 404 | Torneo, edición o categoría fuera de contexto | Revisar identificadores |
| 409 | Nombre duplicado | Revisar categorías activas y archivadas |
| 409 | Creación o reactivación restringida | Revisar estado del torneo y edición |
| 409 | Dependencias incompatibles | Conservar el registro |
| 409 | Conflicto transaccional | Actualizar información y reintentar |
| 500 | Error inesperado | Revisar registros del backend |

Las escrituras utilizan transacciones
y bloqueo jerárquico del torneo
y de la edición.

Respuesta de eliminación exitosa:

```json
{
    "mensaje": "Categoría eliminada correctamente."
}
```

### 13.12. Aislamiento del contexto

Los identificadores de la ruta
deben pertenecer al contexto indicado.

Una categoría de otra edición
no podrá consultarse, modificarse
ni eliminarse utilizando una ruta ajena.

No se deberá sustituir este control
por una búsqueda global del identificador.

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

### 14.2. Resultado esperado en v0.4.0

```text
tests 217
pass 213
fail 0
cancelled 0
skipped 4
todo 0
```

Las cuatro integraciones requieren
habilitación explícita.

El resultado acumulado de 217/217
se obtuvo mediante ejecuciones separadas.

### 14.3. Distribución

| Grupo | Pruebas |
|---|---:|
| Unitarias de autenticación | 13 |
| Unitarias de torneos | 30 |
| Unitarias de ediciones | 59 |
| Unitarias de categorías | 111 |
| Total de pruebas unitarias | 213 |
| Integraciones opcionales | 4 |
| Total general | 217 |

### 14.4. Pruebas de eliminación

Las pruebas de operaciones destructivas
deberán comprobar:

- Identificadores inválidos.
- Registros inexistentes.
- Eliminación de registros autorizados.
- Restricciones administrativas.
- Dependencias.
- Independencia entre contextos.
- Errores inesperados de persistencia.

### 14.5. Interpretación

Las pruebas omitidas no constituyen
fallos cuando corresponden a integraciones
deshabilitadas intencionalmente.

No deberán contabilizarse como aprobadas
si no fueron ejecutadas por separado.

Las pruebas unitarias no reemplazan
las integraciones contra MySQL real.

### 14.6. Pruebas unitarias de EDICIONES

Desde backend:

```powershell
node --test tests/edicion.service.test.js
```

Resultado registrado:

59 pruebas aprobadas.

Regresión de servicios anteriores:

```powershell
node --test tests/auth.service.test.js tests/torneo.service.test.js
```

Resultado registrado:

43 pruebas aprobadas.

### 14.7. Pruebas unitarias de CATEGORÍAS

Desde backend:

```powershell
node --test tests/categoria.service.test.js
```

Resultado registrado:

```text
tests 111
pass 111
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 151.5432
```

Las pruebas utilizan un repositorio simulado.

No requieren realizar escrituras
sobre la base de datos principal.

### 14.8. Regresión general

Desde backend:

```powershell
npm test
```

Resultado esperado:

- 213 pruebas unitarias aprobadas.
- 4 integraciones omitidas.
- 0 pruebas fallidas.

Las integraciones deberán ejecutarse
mediante los procedimientos específicos
de las secciones siguientes.

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

Resultados históricos:

| Versión | Resultado | Duración |
|---|---|---:|
| 0.3.0 | 1/1 | 503,2238 ms |
| 0.4.0 | 1/1 | 522,3231 ms |

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
| Base de integración | altosistemahu004test |
| Base histórica de instalación limpia | altosistemahu005fresh |
| Puerto principal | 3000 |
| Puerto de pruebas | 3001 |
| Administrador de pruebas | admin_pruebas |

La denominación histórica de la base
de integración se conserva para
mantener compatibilidad con las pruebas.

No implica que solamente pueda utilizarse
para HU-004.

### 16.3. Preparación de una instalación nueva

Mediante una cuenta autorizada:

```sql
CREATE DATABASE IF NOT EXISTS altosistemahu004test
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

La cuenta utilizada por el backend
de pruebas deberá disponer de los
permisos correspondientes.

No deberán ampliarse privilegios
globales innecesariamente.

### 16.4. Migraciones de pruebas

Desde la cuarta terminal,
ubicada en backend:

```powershell
$anteriorDB = $env:DB_NAME

try {
    $env:DB_NAME = "altosistemahu004test"

    node -e "const { pool } = require('./src/config/database'); (async () => { try { const [rows] = await pool.query('SELECT DATABASE() AS db'); console.log('Base seleccionada:', rows[0].db); if (rows[0].db !== 'altosistemahu004test') process.exitCode = 1; } finally { await pool.end(); } })().catch(error => { console.error(error.message); process.exitCode = 1; });"

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo verificar la base de pruebas."
    }

    npm run migrate

    if ($LASTEXITCODE -ne 0) {
        throw "Falló la migración de pruebas."
    }
} finally {
    $env:DB_NAME = $anteriorDB
}
```

Verificar que el migrador indique:

```text
Base de datos: altosistemahu004test
```

En v0.4.0 deberán encontrarse aplicadas
las migraciones 001 a 004.

### 16.5. Administrador de pruebas

La cuenta admin_pruebas deberá
crearse dentro de la base aislada.

Durante su creación deberán configurarse
temporalmente:

```text
DB_NAME=altosistemahu004test
ADMIN_USER=admin_pruebas
```

Utilizar el procedimiento de creación
de administradores de la sección 8.

La contraseña deberá ser exclusiva
del entorno de pruebas.

No deberá reutilizarse la contraseña
del administrador principal.

### 16.6. Restricciones

Nunca ejecutar las integraciones de:

- TORNEOS.
- EDICIONES.
- CATEGORÍAS.

Contra la base principal `alto_sistema`.

No modificar el archivo .env principal
para habilitar estas pruebas.

Los registros temporales deberán
identificarse de forma inequívoca.

### 16.7. Instalación limpia histórica de HU-005

La base `altosistemahu005fresh`
fue utilizada para comprobar
las migraciones 001 a 003.

Resultado registrado:

| Ejecución | Registradas inicialmente | Pendientes |
|---|---:|---:|
| Primera | 0 | 3 |
| Segunda | 3 | 0 |

Las tres migraciones se aplicaron
correctamente.

La base se conserva para futuras
verificaciones.

No deberá confundirse con el entorno
de integración HTTP.

### 16.8. Instalación limpia de v0.4.0

Para verificar las cuatro migraciones
sin estructuras ni registros previos,
se propone una nueva base aislada:

`altosistemahu006fresh`

Antes de crearla, comprobar:

```sql
SHOW DATABASES LIKE 'altosistemahu006fresh';
```

Si no existe, crearla mediante
una cuenta autorizada:

```sql
CREATE DATABASE altosistemahu006fresh
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Conceder a la cuenta de aplicación
los permisos necesarios sobre
esta base específica.

No utilizar una base existente
sin verificar previamente su contenido.

### 16.9. Ejecución e idempotencia de v0.4.0

Una vez preparada la nueva base,
desde la cuarta terminal,
ubicada en backend:

```powershell
$anteriorDB = $env:DB_NAME

try {
    $env:DB_NAME = "altosistemahu006fresh"

    node -e "const { pool } = require('./src/config/database'); (async () => { try { const [rows] = await pool.query('SELECT DATABASE() AS db'); console.log('Base seleccionada:', rows[0].db); if (rows[0].db !== 'altosistemahu006fresh') process.exitCode = 1; } finally { await pool.end(); } })().catch(error => { console.error(error.message); process.exitCode = 1; });"

    if ($LASTEXITCODE -ne 0) {
        throw "Base de instalación incorrecta."
    }

    npm run migrate

    if ($LASTEXITCODE -ne 0) {
        throw "Falló la instalación limpia."
    }

    npm run migrate

    if ($LASTEXITCODE -ne 0) {
        throw "Falló la verificación de idempotencia."
    }
} finally {
    $env:DB_NAME = $anteriorDB
}
```

Resultado esperado de la primera ejecución:

```text
Registradas: 0
Pendientes: 4
```

Deberán aplicarse las migraciones:

- 001_usuarios.sql.
- 002_torneos.sql.
- 003_ediciones.sql.
- 004_categorias.sql.

Resultado esperado de la segunda ejecución:

```text
Registradas: 4
Pendientes: 0
```

Estos resultados corresponden
al procedimiento previsto.

Su ejecución y confirmación permanecen
pendientes del cierre técnico de HU-006.

### 16.10. Conservación de bases aisladas

No será necesario eliminar las bases
de pruebas al detener el backend aislado.

Las bases podrán conservarse para
futuras verificaciones.

La instalación desde cero deberá
realizarse sobre una base realmente vacía.

No deberá recurrirse a DROP DATABASE
para repetir una prueba sin autorización.

---

## 17. INTEGRACIONES DE MÓDULOS DEPORTIVOS

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
- Conexión con MySQL.
- Sesiones disponibles.
- Módulos correspondientes habilitados.

No continuar si la base o el puerto
no corresponden al entorno de pruebas.

### 17.2. Integración de TORNEOS

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

### 17.3. Resultado esperado de TORNEOS

```text
tests 1
pass 1
fail 0
skipped 0
```

Resultados históricos:

| Versión | Resultado | Duración |
|---|---|---:|
| 0.2.0 | 1/1 | 1414,30 ms |
| 0.3.0 | 1/1 | 1394,3234 ms |
| 0.4.0 | 1/1 | 1277,2883 ms |

La integración contempla 20 controles
internos previstos.

Estos no se contabilizan como
pruebas automatizadas independientes.

### 17.4. Alcance de TORNEOS

La integración contempla:

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
- Independencia de registros.
- Reutilización de nombres.
- Cierre de sesión.
- Limpieza de registros temporales.

### 17.5. Finalización del backend aislado

Cuando finalicen todas las integraciones
deportivas, detener la tercera terminal:

```text
Ctrl + C
```

Mantener operativo el backend principal
si se continúa trabajando
desde la interfaz administrativa.

No detener MySQL.

### 17.6. Integración de EDICIONES

Reutilizar:

- Base altosistemahu004test.
- Backend aislado del puerto 3001.
- Administrador de pruebas.

Verificar que las migraciones
correspondientes estén aplicadas.

Desde la cuarta terminal,
ubicada en backend:

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

Resultados históricos:

| Versión | Resultado | Duración |
|---|---|---:|
| 0.3.0 | 1/1 | 1860,0626 ms |
| 0.4.0 | 1/1 | 1891,3573 ms |

La integración contempla 14 bloques
internos de verificación previstos.

El resultado global fue satisfactorio.

Los bloques internos no constituyen
14 pruebas independientes.

### 17.7. Integración de CATEGORÍAS

Requisitos:

- MySQL operativo.
- Base altosistemahu004test.
- Migraciones 001 a 004 aplicadas.
- Backend aislado en puerto 3001.
- Administrador de pruebas habilitado.

Desde la cuarta terminal,
ubicada en backend:

```powershell
$anteriorDB = $env:DB_NAME

$clave = Read-Host "Contraseña del administrador de pruebas" -AsSecureString

try {
    $env:DB_NAME = "altosistemahu004test"
    $env:ALTO_CATEGORIA_INTEGRATION_TEST = "1"
    $env:ALTO_TEST_USER = "admin_pruebas"
    $env:ALTO_TEST_PASSWORD = [System.Net.NetworkCredential]::new("", $clave).Password

    node --test tests/categoria.integration.test.js
} finally {
    $env:DB_NAME = $anteriorDB

    Remove-Item Env:ALTO_CATEGORIA_INTEGRATION_TEST -ErrorAction SilentlyContinue
    Remove-Item Env:ALTO_TEST_USER -ErrorAction SilentlyContinue
    Remove-Item Env:ALTO_TEST_PASSWORD -ErrorAction SilentlyContinue
    Remove-Variable clave -ErrorAction SilentlyContinue
}
```

### 17.8. Resultado confirmado de CATEGORÍAS

```text
LIMPIEZA — Registros ficticios eliminados correctamente.
tests 1
suites 0
pass 1
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 2723.073
```

Resultado global:

- Una prueba integral aprobada.
- 28 controles internos superados.
- Cero pruebas fallidas.
- Limpieza satisfactoria.

### 17.9. Alcance de CATEGORÍAS

| N.º | Control |
|---:|---|
| 01 | Base de datos aislada |
| 02 | Servidor operativo |
| 03 | Protección sin autenticación |
| 04 | Autenticación y aislamiento |
| 05 | Contextos ficticios |
| 06 | Ediciones inicialmente vacías |
| 07 | Control de origen |
| 08 | Validaciones de creación |
| 09 | Creación y normalización |
| 10 | Unicidad |
| 11 | Independencia entre contextos |
| 12 | Consulta individual |
| 13 | Identificadores inválidos |
| 14 | Aislamiento de operaciones |
| 15 | Edición parcial |
| 16 | Archivado y reactivación |
| 17 | Filtros y búsqueda |
| 18 | Estados inválidos |
| 19 | Edición en curso |
| 20 | Edición finalizada |
| 21 | Reapertura |
| 22 | Torneo archivado |
| 23 | Reactivación del torneo |
| 24 | Integridad referencial |
| 25 | Persistencia |
| 26 | Eliminación definitiva |
| 27 | Eliminación de contextos vacíos |
| 28 | Cierre de sesión |

Los controles se ejecutan dentro
de una única prueba integral.

### 17.10. Limpieza automática

La integración de categorías utiliza
registros ficticios identificados
mediante UUID.

La limpieza respeta el orden:

```text
CATEGORÍAS → EDICIONES → TORNEOS
```

Las restricciones referenciales
permanecen habilitadas.

La limpieza fue satisfactoria tanto
durante la primera ejecución fallida
como durante la ejecución aprobada.

### 17.11. Incidente de búsqueda detectado en HU-006

La primera integración superó
los controles 01 a 16.

Durante el control 17 se detectó:

```text
Descripción: Competición amateur
Búsqueda: competicion

Resultado esperado: 1
Resultado obtenido: 0
```

Se comprobó que el archivo de pruebas
estaba correctamente codificado en UTF-8.

La causa se localizó en el mecanismo
de búsqueda SQL basado en LOCATE.

Se corrigió el repositorio de categorías
mediante LIKE e intercalación explícita
utf8mb4_unicode_ci.

También se incorporó el escape de
caracteres especiales de búsqueda.

Después de reiniciar el backend aislado,
la prueba original fue aprobada.

No se modificaron los criterios
de aceptación ni la migración 004.

### 17.12. Procedimiento ante una integración fallida

1. Conservar el mensaje de error.
2. Identificar la prueba y línea afectada.
3. Confirmar la base de datos seleccionada.
4. Verificar el estado de los registros temporales.
5. Identificar la capa responsable.
6. Corregir la causa del problema.
7. Reiniciar el backend si corresponde.
8. Ejecutar nuevamente la prueba original.
9. Verificar la limpieza.
10. Ejecutar las regresiones necesarias.

No deberán alterarse las pruebas
para ocultar un error de implementación.

### 17.13. Regresión de v0.4.0

| Grupo | Resultado |
|---|---:|
| Unitarias de autenticación | 13/13 |
| Unitarias de torneos | 30/30 |
| Unitarias de ediciones | 59/59 |
| Unitarias de categorías | 111/111 |
| Integración de autenticación | 1/1 |
| Integración de torneos | 1/1 |
| Integración de ediciones | 1/1 |
| Integración de categorías | 1/1 |
| Total acumulado | 217/217 |

Las integraciones se ejecutaron
de manera separada.

No deberán habilitarse todas las
integraciones deportivas simultáneamente
sin verificar su aislamiento.

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

Desde frontend:

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

Las tarjetas y los accesos a módulos
dependientes deberán mantenerse
correctamente distribuidos en
pantallas pequeñas.

La identidad institucional no deberá
modificarse al incorporar nuevos
módulos deportivos.

### 18.6. Limitaciones

La simulación de dispositivos móviles
mediante el navegador no sustituye
las pruebas en dispositivos físicos.

Una compilación exitosa tampoco
garantiza por sí sola la ausencia
de errores funcionales.

### 18.7. Verificación histórica de v0.3.0

El análisis estático del frontend
fue informado sin errores.

La compilación de producción
fue satisfactoria.

Durante la implementación se registró
una compilación de 2,52 segundos.

La validación responsive de EDICIONES
fue confirmada mediante simulación.

HU-005 se encuentra consolidada.

### 18.8. Verificación de CATEGORÍAS

Comprobar:

- Acceso desde EDICIONES.
- Identificación del contexto.
- Indicadores de total, activas y archivadas.
- Búsqueda.
- Filtros.
- Formulario.
- Contadores de caracteres.
- Archivado.
- Reactivación.
- Eliminación.
- Advertencias de restricciones.
- Actualización de indicadores externos.

Los controles funcionales de HU-006
fueron revisados durante el desarrollo.

### 18.9. Simulación móvil

Desde el navegador:

1. Abrir las herramientas de desarrollo con F12.
2. Activar la emulación con Ctrl + Shift + M.
3. Seleccionar una resolución de referencia.
4. Revisar la distribución de los componentes.
5. Comprobar las acciones administrativas.
6. Verificar que no existan desbordamientos incompatibles.

Resolución de referencia utilizada:

390 × 844 píxeles.

La validación de HU-006 fue confirmada
mediante emulación en el navegador.

No se considera una verificación
sobre un dispositivo físico.

### 18.10. Capturas esenciales de v0.4.0

| Archivo | Evidencia |
|---|---|
| 30-ediciones-categorias-v040.png | Indicadores externos |
| 31-categorias-listado-v040.png | Listado y estados |
| 32-categorias-formulario-v040.png | Formulario |
| 33-movil-categorias-v040.png | Adaptación móvil |
| 34-pruebas-v040.png | Regresión automatizada |

Las cinco capturas fueron revisadas.

Se verificará su presencia definitiva
en el repositorio antes del commit.

### 18.11. Verificación técnica pendiente

Antes de finalizar HU-006:

```powershell
npm run lint
npm run build
```

No se considerarán aprobados
estos controles hasta obtener
sus resultados correspondientes.

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
incorporarlos accidentalmente a Git.

No constituye por sí sola una protección
frente a fallas del disco o pérdida
del equipo.

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
sin depender de la codificación
de PowerShell.

Durante la generación del respaldo
deberán evitarse cambios estructurales
concurrentes sobre la base.

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

La existencia de un archivo no garantiza
por sí sola su recuperación.

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

Archivo registrado:

`alto_sistema_v0.2.0_pre_HU005_2026-11-27_23-57-09.sql`

Tamaño confirmado:

5682 bytes.

Ubicación:

`%LOCALAPPDATA%\ALTO-SISTEMA\backups`

Corresponde a v0.2.0, antes de
incorporar la tabla ediciones.

### 19.9. Respaldo previo a HU-006

Antes de aplicar la migración 004,
se registró el respaldo:

`alto_sistema_v0.3.0_pre_HU006_2026-11-28_03-51-42.sql`

Tamaño confirmado:

7358 bytes.

Ubicación:

`%LOCALAPPDATA%\ALTO-SISTEMA\backups`

El respaldo corresponde a la versión
0.3.0 anterior a la incorporación
de la tabla categorias.

La existencia y tamaño del archivo
fueron confirmados.

No se ha comprobado todavía
su restauración efectiva.

### 19.10. Respaldo posterior a HU-006

Los futuros respaldos de v0.4.0
deberán incluir la estructura
y los datos correspondientes a:

- Usuarios.
- Torneos.
- Ediciones.
- Categorías.
- Historial de migraciones.
- Infraestructura de sesiones, cuando exista.

La generación de un respaldo
posterior a HU-006 y su restauración
aislada deberán registrarse cuando
se realicen efectivamente.

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

Comprobar previamente la existencia
de la base de restauración:

```sql
SHOW DATABASES LIKE 'alto_sistema_restore_test';
```

Si no existe:

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

Comprobar:

- Versión de origen.
- Fecha.
- Tamaño.
- Base de datos correspondiente.
- Integridad del archivo, cuando exista un hash registrado.

El archivo no deberá contener
instrucciones que seleccionen
o eliminen la base principal.

Los respaldos generados mediante
este manual no utilizan la opción
--databases.

Esto no sustituye la revisión
del contenido antes de restaurarlo.

### 20.5. Restauración mediante MySQL Client

Conectarse explícitamente a la base
de restauración:

```powershell
$usuario = Read-Host "Usuario de MySQL"

& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" `
    --host=localhost `
    --port=3306 `
    --user=$usuario `
    --password `
    --database=alto_sistema_restore_test
```

Desde MySQL Client:

```sql
SELECT DATABASE();
SHOW TABLES;
```

La base seleccionada deberá ser:

`alto_sistema_restore_test`

Deberá encontrarse vacía antes
de importar un respaldo nuevo.

Ejecutar SOURCE indicando la ruta
real del archivo:

```sql
SOURCE C:/ruta/al/respaldo/alto_sistema_FECHA.sql
```

La ruta anterior es ilustrativa.

Revisar todos los mensajes
generados durante la importación.

### 20.6. Verificación posterior

```sql
SELECT DATABASE();

SHOW TABLES;

SELECT COUNT(*) FROM usuarios;

SELECT COUNT(*) FROM torneos;
```

Las consultas deberán corresponder
a las tablas incluidas en el respaldo.

Para respaldos que incluyan
la migración 003:

```sql
SELECT COUNT(*) FROM ediciones;

SHOW CREATE TABLE ediciones;

SELECT COUNT(*) AS ediciones_huerfanas
FROM ediciones e
LEFT JOIN torneos t ON t.id = e.torneo_id
WHERE t.id IS NULL;
```

Para respaldos que incluyan
la migración 004:

```sql
SELECT COUNT(*) FROM categorias;

SHOW CREATE TABLE categorias;

SELECT COUNT(*) AS categorias_huerfanas
FROM categorias c
LEFT JOIN ediciones e ON e.id = c.edicion_id
WHERE e.id IS NULL;
```

Resultado esperado:

- Cero ediciones huérfanas.
- Cero categorías huérfanas.

Las cantidades deberán contrastarse
con los registros correspondientes
al respaldo seleccionado.

No deberán compararse indiscriminadamente
con información de otra fecha.

### 20.7. Estado de verificación

| Versión del respaldo | Restauración aislada |
|---|---|
| 0.1.3 | Verificada históricamente |
| 0.2.0 con torneos | Pendiente de verificación específica |
| 0.3.0 con ediciones | Pendiente |
| 0.4.0 con categorías | Pendiente |

La instalación desde cero mediante
migraciones no sustituye la restauración
de un respaldo con datos.

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

### 20.9. Recuperación de estructuras anteriores

Un respaldo de v0.3.0 no contiene
la información de categorías creada
posteriormente en v0.4.0.

Aplicar la migración 004 sobre
una restauración de v0.3.0 permite
incorporar la estructura correspondiente,
pero no recupera las categorías
creadas después del respaldo.

La recuperación de datos y la actualización
estructural son operaciones diferentes.

### 20.10. Seguridad posterior a una restauración

Los respaldos pueden contener registros
de sesiones previamente emitidas.

Antes de utilizar una base restaurada
como entorno operativo deberá evaluarse
la validez de sus sesiones y credenciales.

No deberá exponerse una base restaurada
de pruebas a usuarios no autorizados.

---

## 21. LIMPIEZA DE REGISTROS TEMPORALES

### 21.1. Propósito

Evitar que los datos utilizados durante
el desarrollo permanezcan mezclados
con competiciones reales.

### 21.2. Registros históricos de HU-004

Durante las comprobaciones se utilizaron:

- Prueba Nocturno Inicio 2027.
- torneo de prueba.

Estos registros fueron eliminados
durante el cierre correspondiente.

### 21.3. Procedimiento oficial

La limpieza administrativa deberá
realizarse preferentemente mediante
la interfaz de ALTO-SISTEMA.

Procedimiento:

1. Iniciar sesión.
2. Identificar el contexto temporal.
3. Comprobar sus dependencias.
4. Eliminar únicamente los registros de prueba.
5. Confirmar las operaciones.
6. Verificar los indicadores.
7. Comprobar la persistencia después de recargar.

### 21.4. Verificación posterior

Comprobar:

- Ausencia de registros eliminados.
- Conservación de otros contextos.
- Actualización de indicadores.
- Persistencia después de recargar.
- Ausencia de errores.

Cuando todos los registros existentes
sean temporales, el resultado podrá
ser un listado vacío.

No deberán eliminarse competiciones
reales para conseguir un contador cero.

### 21.5. Consultas de verificación de torneos

Desde MySQL Client:

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

Cantidades:

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

Las intervenciones directas sobre
la base deberán reservarse para
situaciones justificadas de mantenimiento.

### 21.7. Resultado histórico de HU-004

La eliminación de registros temporales
fue realizada mediante la interfaz.

La comprobación funcional fue satisfactoria.

No fue necesario modificar manualmente
la estructura de MySQL.

### 21.8. Limpieza histórica de HU-005

Durante la validación se utilizaron:

- TORNEO DE PRUEBA HU005.
- NOCTURNO 2007, renombrada a NOCTURNO 2027.
- COPA DE VERANO 2027.

Se eliminaron primero las ediciones
temporales y posteriormente el torneo.

La limpieza fue confirmada.

### 21.9. Consultas de verificación de ediciones

```sql
SELECT DATABASE();

SELECT
    t.id,
    t.nombre,
    COUNT(e.id) AS total_ediciones,
    COALESCE(
        SUM(e.estado = 'EN_CURSO'),
        0
    ) AS en_curso
FROM torneos t
LEFT JOIN ediciones e ON e.torneo_id = t.id
GROUP BY t.id, t.nombre
ORDER BY t.id;
```

### 21.10. Registros utilizados en HU-006

Durante las comprobaciones funcionales
y las capturas se utilizaron contextos
deportivos demostrativos, incluyendo:

- NOCTURNO.
- NOCTURNO 2027.
- NOCTURNO 2028.
- LIBRE.
- SENIOR.

Los nombres podrán haberse modificado
durante las pruebas.

No deberá utilizarse únicamente
la coincidencia del nombre para
identificar registros temporales.

### 21.11. Limpieza de HU-006

Procedimiento recomendado:

1. Ingresar a TORNEOS.
2. Identificar el torneo demostrativo.
3. Ingresar a EDICIONES.
4. Seleccionar GESTIONAR CATEGORÍAS.
5. Identificar las categorías temporales.
6. Eliminar las categorías correspondientes.
7. Regresar a EDICIONES.
8. Verificar que las ediciones temporales estén vacías.
9. Eliminar las ediciones de prueba.
10. Regresar a TORNEOS.
11. Eliminar el torneo temporal sin dependencias.
12. Verificar los registros conservados.

La limpieza final deberá realizarse
después de obtener las capturas oficiales.

### 21.12. Consultas de verificación de categorías

```sql
SELECT DATABASE();

SELECT
    t.id AS torneo_id,
    t.nombre AS torneo,
    e.id AS edicion_id,
    e.nombre AS edicion,
    c.id AS categoria_id,
    c.nombre AS categoria,
    c.estado
FROM categorias c
INNER JOIN ediciones e ON e.id = c.edicion_id
INNER JOIN torneos t ON t.id = e.torneo_id
ORDER BY t.id, e.id, c.id;
```

Indicadores por edición:

```sql
SELECT
    e.id AS edicion_id,
    e.nombre AS edicion,
    COUNT(c.id) AS total_categorias,
    COALESCE(
        SUM(c.estado = 'ACTIVA'),
        0
    ) AS activas,
    COALESCE(
        SUM(c.estado = 'ARCHIVADA'),
        0
    ) AS archivadas
FROM ediciones e
LEFT JOIN categorias c ON c.edicion_id = e.id
GROUP BY e.id, e.nombre
ORDER BY e.id;
```

Estas consultas son de solo lectura.

### 21.13. Limpieza de integraciones

Las pruebas de integración deportivas
realizan su propia limpieza controlada.

Los registros ficticios deberán
identificarse inequívocamente.

En HU-006 se confirmó la limpieza
automática de categorías, ediciones
y torneos creados durante la integración.

Las bases aisladas se conservan.

### 21.14. Estado de limpieza de HU-006

| Entorno | Resultado |
|---|---|
| Integración fallida inicial | Limpieza completada |
| Integración satisfactoria | Limpieza completada |
| Pruebas funcionales | Se eliminaron registros temporales |
| Registros recreados para capturas | Limpieza final pendiente |

No deberá confundirse la limpieza
automática de integración con la
limpieza de registros demostrativos
de la base principal.

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

Backend principal:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
```

Frontend:

```powershell
Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
```

Backend aislado:

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
- Backend operativo.
- Base correspondiente.
- Estado de sesión.

### 22.4. Error de origen

Revisar:

- Dirección utilizada en el navegador.
- FRONTEND_URL.
- Puerto del frontend.
- Configuración CORS.
- Controles de origen.

No desactivar las protecciones
como solución permanente.

### 22.5. Error de migración

Revisar:

- Base seleccionada.
- Historial de migraciones.
- Archivos SQL.
- Checksums.
- Verificadores estructurales.
- Estado de las tablas.
- Permisos del usuario.

No modificar una migración aplicada
para evitar el error.

### 22.6. Error de nombre duplicado

Comprobar los registros existentes,
incluidos los archivados o finalizados.

Alcance de unicidad:

| Entidad | Contexto |
|---|---|
| Torneo | General |
| Edición | Torneo correspondiente |
| Categoría | Edición correspondiente |

Las comparaciones contemplan
la normalización de nombres
y la intercalación de MySQL.

No eliminar registros existentes
solamente para reutilizar su nombre.

### 22.7. Error al eliminar un registro

Comprobar:

- Sesión autenticada.
- Registro existente.
- Identificador válido.
- Contexto correcto.
- Conexión con el backend.
- Restricciones de integridad.

Si el registro ya fue eliminado,
actualizar el listado.

Si existen dependencias incompatibles,
conservar o archivar cuando corresponda.

No deshabilitar claves foráneas
para forzar la eliminación.

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
exclusivamente por advertencias
del editor.

### 22.10. Indicadores incorrectos

Actualizar la consulta correspondiente.

Verificar:

- Disponibilidad de la API.
- Datos persistentes.
- Filtros administrativos.
- Estado de carga.
- Respuestas del backend.
- Contexto solicitado.

No reemplazar indicadores reales
por valores constantes.

### 22.11. Problemas específicos de EDICIONES

| Problema | Acción |
|---|---|
| No permite iniciar o reabrir | Revisar estado del torneo |
| Fecha rechazada | Revisar formato y coherencia cronológica |
| Nombre duplicado | Revisar ediciones del mismo torneo |
| Edición inexistente | Revisar contexto e identificador |
| No permite eliminar | Comprobar categorías asociadas |
| Indicadores no disponibles | Revisar API correspondiente |

No modificar directamente el estado
de una edición para evitar
restricciones de negocio.

### 22.12. Problemas específicos de CATEGORÍAS

| Problema | Acción |
|---|---|
| No permite crear | Revisar torneo y edición |
| No permite reactivar | Revisar restricciones del contexto |
| Nombre duplicado | Consultar categorías activas y archivadas |
| Categoría inexistente | Verificar edición e identificador |
| Indicadores incorrectos | Actualizar listado y revisar API |
| No permite eliminar edición | Comprobar categorías asociadas |
| Búsqueda sin resultados esperados | Revisar filtros, intercalación y repositorio |

Si el torneo está archivado,
reactivarlo cuando corresponda.

Si la edición está finalizada,
reabrirla únicamente cuando resulte
compatible con las reglas deportivas.

Estas acciones no deberán utilizarse
para alterar indebidamente el historial.

### 22.13. Caracteres acentuados incorrectos

Durante HU-006 se observó una representación
incorrecta de caracteres UTF-8
en Windows PowerShell.

Ejemplo:

```text
CompeticiÃ³n amateur
```

El contenido original era:

```text
Competición amateur
```

Antes de modificar un archivo:

- Verificar su codificación en VS Code.
- Comprobar que utilice UTF-8.
- Diferenciar el archivo real de su representación en terminal.
- Revisar la codificación de MySQL cuando corresponda.

Para diagnósticos específicos de terminal
puede utilizarse la opción:

```text
-Encoding UTF8
```

No deberá solicitarse la recuperación
de archivos completos por terminal
cuando puedan compartirse directamente
desde el árbol de VS Code.

### 22.14. Búsqueda insensible a acentos

Si una búsqueda no encuentra un texto
que contiene caracteres acentuados:

1. Comprobar el dato almacenado.
2. Comprobar el filtro enviado.
3. Verificar el contexto.
4. Revisar la intercalación SQL.
5. Revisar la expresión utilizada.
6. Ejecutar el caso real contra MySQL.

El repositorio de categorías utiliza
LIKE con intercalación explícita
utf8mb4_unicode_ci.

Los caracteres especiales del patrón
se escapan para conservar su búsqueda
literal.

No modificar las pruebas para adaptar
el resultado esperado a una consulta
que incumple las reglas aprobadas.

### 22.15. Servidor aislado incorrecto

Si el backend de pruebas apunta
a la base principal o a un puerto
incorrecto:

1. Detener inmediatamente el proceso.
2. No ejecutar pruebas deportivas.
3. Revisar DB_NAME.
4. Revisar PORT.
5. Verificar la base mediante SELECT DATABASE().
6. Reiniciar el entorno aislado.

### 22.16. El navegador no puede acceder

Comprobar por separado:

Backend:

```text
http://localhost:3000/api/health
```

Frontend:

```text
http://localhost:5173
```

Si el backend está operativo
pero la aplicación no abre,
verificar que Vite se encuentre iniciado.

Si Vite informa un puerto diferente,
revisar si el puerto 5173 está ocupado.

Mantener coherencia entre el puerto
del frontend y FRONTEND_URL.

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

Desde backend o frontend:

```powershell
npm ls --depth=0
npm outdated
npm audit
```

No ejecutar actualizaciones forzadas
sin evaluar compatibilidad y riesgos.

### 23.3. Actualización de versión

Desde backend o frontend,
según corresponda:

```powershell
npm version 0.4.0 --no-git-tag-version
```

El comando deberá utilizarse
con la versión del incremento
que se esté preparando.

No deberá repetirse innecesariamente
si la versión ya es correcta.

Puede utilizarse --ignore-scripts
cuando corresponda evitar scripts
asociados al versionado.

### 23.4. Consistencia

Verificar la versión entre:

- Backend.
- Frontend.
- Archivos package.json.
- Archivos package-lock.json.
- Configuraciones de aplicación.
- Identificación visual.
- Documentación.

### 23.5. Actualización de archivos

Modalidad preferente:

- Código completo directamente en la conversación.
- Reemplazo desde VS Code.
- Un archivo o paso operativo por vez.
- Conservación de las configuraciones privadas.

Cuando se utilice un ZIP:

1. Verificar su contenido.
2. Detener los procesos afectados.
3. Extraer los archivos.
4. Reemplazar únicamente los archivos indicados.
5. Conservar las configuraciones privadas.
6. Reiniciar los servicios.
7. Ejecutar las pruebas necesarias.

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
- Capturas correspondientes.
- CHECK integral.

Desde la raíz:

```powershell
git status
git diff --stat
git diff --check
```

Los archivos no rastreados deberán
revisarse mediante git status,
ya que git diff no los incluye
automáticamente.

### 23.7. Consolidación

El incremento deberá contar con
aprobación expresa antes de registrarse.

Historial:

| Versión | Historia | Commit |
|---|---|---|
| 0.2.0 | HU-004 | 27654c0 |
| 0.3.0 | HU-005 | ccfb4d2 |
| 0.4.0 | HU-006 | Pendiente |

Mensaje propuesto para HU-006:

```text
feat: HU-006 - Gestion de categorias (v0.4.0)
```

El mensaje definitivo deberá corresponder
a los cambios efectivamente incorporados.

Antes del commit:

```powershell
git diff --cached --stat
git diff --cached --check
```

La selección de archivos deberá
realizarse de manera controlada.

### 23.8. Publicación

Rama principal utilizada:

`master`

Después del commit aprobado:

```powershell
git push origin master
```

Verificar posteriormente:

```powershell
git status
git log -1 --oneline
```

La publicación deberá confirmarse
antes de considerar consolidado
el incremento.

### 23.9. Verificación de coherencia de versión

Desde la raíz del proyecto,
en la cuarta terminal:

```powershell
node -e "for (const carpeta of ['backend','frontend']) { const p = require('./' + carpeta + '/package.json'); const l = require('./' + carpeta + '/package-lock.json'); console.log(carpeta + '/package.json: ' + p.version); console.log(carpeta + '/package-lock.json: ' + l.version); console.log(carpeta + '/package-lock.json (raiz): ' + l.packages[''].version); }"

Select-String -Path backend/src/config/app.config.js, frontend/src/config/app.config.js -Pattern "version:"
```

Se verifican ocho valores distribuidos
en seis archivos.

Resultado esperado de HU-006:

```text
0.4.0
```

En todos los valores correspondientes.

La verificación conjunta permanece
pendiente del cierre técnico.

### 23.10. Revisión de capturas

Desde la raíz:

```powershell
Get-ChildItem docs/capturas -Filter "*-v040.png" |
    Select-Object Name, Length
```

Archivos esperados:

```text
30-ediciones-categorias-v040.png
31-categorias-listado-v040.png
32-categorias-formulario-v040.png
33-movil-categorias-v040.png
34-pruebas-v040.png
```

Comprobar:

- Cinco archivos correspondientes.
- Nombres correctos.
- Tamaño superior a cero.
- Enlaces del README.
- Ausencia de información privada innecesaria.

La revisión visual de las imágenes
no sustituye la comprobación
de su presencia en el repositorio.

### 23.11. Política de capturas esenciales

A partir de v0.4.0 se documentarán
principalmente las novedades
de cada incremento.

No será necesario repetir capturas
del Dashboard, login o módulos
que no hayan cambiado.

Las evidencias históricas se conservarán.

### 23.12. Cierre operativo de una historia

Antes de iniciar una historia nueva:

1. Completar las verificaciones técnicas.
2. Limpiar los registros demostrativos.
3. Actualizar la documentación.
4. Verificar las evidencias.
5. Completar el CHECK integral.
6. Obtener aprobación expresa.
7. Registrar el commit.
8. Publicar en GitHub.
9. Confirmar el estado del repositorio.

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
- Instalación limpia.
- Restauración.
- Producción futura.

### 24.3. Operaciones destructivas

Toda operación destructiva deberá
identificar previamente:

- Base de datos.
- Entidad.
- Registro afectado.
- Contexto deportivo.
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

Antes del despliegue deberán evaluarse:

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

### 24.9. Seguridad de evidencias

Antes de publicar capturas
o registros de pruebas, revisar:

- Usuarios administrativos visibles.
- Rutas personales del sistema operativo.
- Variables de entorno.
- Información de sesiones.
- Datos personales.
- Información deportiva privada.

La información innecesaria podrá
recortarse o anonimizarse.

No deberán modificarse los resultados
de pruebas para mejorar artificialmente
las evidencias.

### 24.10. Integridad jerárquica

Las relaciones actuales son:

```text
TORNEO
  └── EDICIÓN
        └── CATEGORÍA
```

Las relaciones referenciales
son restrictivas.

No deberán deshabilitarse
para facilitar eliminaciones.

Las futuras entidades deportivas
deberán respetar la independencia
de cada contexto.

---

## 25. ESTADO OPERATIVO Y CONTROL FINAL

### 25.1. Registro histórico de v0.2.0

| Propiedad | Valor |
|---|---|
| ALTO-SISTEMA | 0.2.0 |
| Sistema de Diseño | 1.0 |
| Historia | HU-004 |
| Módulo incorporado | TORNEOS |
| Commit | 27654c0 |
| Estado | Consolidado |

### 25.2. Resultados históricos de HU-004

| Grupo | Resultado |
|---|---:|
| Unitarias de autenticación | 13/13 |
| Unitarias de torneos | 30/30 |
| Integración de autenticación | 1/1 |
| Integración de torneos | 1/1 |
| Total acumulado | 45/45 |

Las ejecuciones fueron separadas.

### 25.3. Regresión histórica de HU-004

| Ejecución | Totales | Aprobadas | Omitidas | Fallidas |
|---|---:|---:|---:|---:|
| Unitarias | 45 | 43 | 2 | 0 |
| Regresión con autenticación | 45 | 44 | 1 | 0 |
| Integración aislada | 1 | 1 | 0 | 0 |

### 25.4. Tiempos históricos de HU-004

| Operación | Duración |
|---|---:|
| Pruebas unitarias | 523,10 ms |
| Regresión con autenticación | 716,46 ms |
| Integración de torneos | 1414,30 ms |
| Compilación frontend | 3,49 s |

Los tiempos corresponden al entorno
local de desarrollo.

### 25.5. Verificaciones complementarias de HU-004

- ESLint satisfactorio.
- Compilación exitosa.
- Dos migraciones verificadas.
- Sistema de Diseño v1.0.
- Validación funcional.
- Eliminación definitiva.
- Cancelación de eliminación.
- Limpieza de registros temporales.
- CHECK integral aprobado.
- Publicación completada.

### 25.6. Mantenimiento periódico recomendado

- Verificar disponibilidad de servicios.
- Revisar errores operativos.
- Generar respaldos.
- Comprobar restauraciones.
- Auditar dependencias.
- Revisar cambios pendientes en Git.
- Verificar seguridad de credenciales.
- Comprobar integridad de migraciones.
- Actualizar la documentación.

### 25.7. Verificaciones generales pendientes

- Restauración de respaldos con entidades deportivas.
- Automatización de respaldos.
- Conservación de copias externas.
- Pruebas de rendimiento y carga.
- Pruebas automatizadas del frontend.
- Auditoría formal de accesibilidad.
- Validación en dispositivos móviles físicos.
- Verificación de futuras claves foráneas.
- Optimización de recursos tipográficos.
- Evaluación de seguridad de producción.
- Despliegue en producción.

### 25.8. Cierre histórico de HU-004

- [x] Backend implementado.
- [x] Frontend implementado.
- [x] Gestión integral de torneos.
- [x] Sistema de Diseño.
- [x] Eliminación definitiva.
- [x] Pruebas automatizadas: 45/45.
- [x] Regresión satisfactoria.
- [x] ESLint y compilación.
- [x] Migraciones verificadas.
- [x] Validación funcional.
- [x] Limpieza de registros temporales.
- [x] Versionado.
- [x] Documentación.
- [x] Capturas.
- [x] CHECK integral.
- [x] Commit.
- [x] Publicación.

HU-004 consolidada mediante
el commit `27654c0`.

### 25.9. Registro histórico de v0.3.0

| Propiedad | Valor |
|---|---|
| ALTO-SISTEMA | 0.3.0 |
| Sistema de Diseño | 1.0 |
| Historia | HU-005 |
| Módulo incorporado | EDICIONES |
| Migraciones | 3 |
| Commit | ccfb4d2 |
| Estado | Consolidado |

### 25.10. Resultados históricos de HU-005

| Grupo | Resultado |
|---|---:|
| Unitarias de autenticación | 13/13 |
| Unitarias de torneos | 30/30 |
| Unitarias de ediciones | 59/59 |
| Integración de autenticación | 1/1 |
| Integración de torneos | 1/1 |
| Integración de ediciones | 1/1 |
| Total acumulado | 105/105 |

Resultados complementarios:

- Instalación limpia de tres migraciones.
- Idempotencia verificada.
- Integridad referencial torneo-edición.
- 17 controles funcionales.
- Adaptación responsive confirmada.
- ESLint y compilación satisfactorios.
- Limpieza de registros demostrativos.
- Doce capturas oficiales.
- Coherencia de versiones.
- CHECK integral aprobado.

### 25.11. Cierre histórico de HU-005

- [x] Backend y frontend implementados.
- [x] Migración 003 aplicada.
- [x] Integridad referencial.
- [x] Instalación limpia.
- [x] Idempotencia.
- [x] Pruebas automatizadas: 105/105.
- [x] Regresión.
- [x] ESLint y compilación.
- [x] Verificación funcional y responsive.
- [x] Limpieza de registros temporales.
- [x] Versionado y reinicio.
- [x] Consolidación documental.
- [x] Capturas oficiales.
- [x] CHECK integral.
- [x] Commit.
- [x] Publicación.

HU-005 consolidada mediante
el commit `ccfb4d2`.

### 25.12. Estado operativo actual — v0.4.0

| Propiedad | Valor |
|---|---|
| ALTO-SISTEMA | 0.4.0 |
| Sistema de Diseño | 1.0 |
| Historia | HU-006 |
| Módulos deportivos | TORNEOS, EDICIONES y CATEGORÍAS |
| Base principal | alto_sistema |
| Base de integración | altosistemahu004test |
| Puerto principal | 3000 |
| Puerto aislado | 3001 |
| Puerto frontend | 5173 |
| Migraciones aplicadas | 4 |
| Última versión consolidada | 0.3.0 |

El backend principal y el frontend
iniciaron correctamente con v0.4.0.

### 25.13. Resultados de HU-006

| Grupo | Resultado |
|---|---:|
| Unitarias de autenticación | 13/13 |
| Unitarias de torneos | 30/30 |
| Unitarias de ediciones | 59/59 |
| Unitarias de categorías | 111/111 |
| Total unitarias | 213/213 |
| Integración de autenticación | 1/1 |
| Integración de torneos | 1/1 |
| Integración de ediciones | 1/1 |
| Integración de categorías | 1/1 |
| Total integraciones | 4/4 |
| Total acumulado | 217/217 |

Las integraciones se ejecutaron
por separado.

El resultado acumulado no representa
una única ejecución con las 217
pruebas habilitadas simultáneamente.

### 25.14. Tiempos registrados de HU-006

| Operación | Duración |
|---|---:|
| Unitarias de categorías | 151,5432 ms |
| Integración de categorías aprobada | 2723,073 ms |
| Regresión unitaria general | 651,1334 ms |
| Integración de ediciones | 1891,3573 ms |
| Integración de torneos | 1277,2883 ms |
| Integración de autenticación | 522,3231 ms |

Los tiempos corresponden
al entorno local de desarrollo.

No representan mediciones
de rendimiento en producción.

### 25.15. Validación funcional de HU-006

Durante el desarrollo se revisaron
17 controles funcionales relacionados con:

- Integración con EDICIONES.
- Creación de categorías.
- Validaciones.
- Edición.
- Archivado.
- Reactivación.
- Búsqueda.
- Filtros.
- Indicadores.
- Independencia de contextos.
- Restricciones de edición finalizada.
- Restricciones de torneo archivado.
- Integridad referencial.
- Eliminación.
- Adaptación responsive.

El administrador confirmó resultados
satisfactorios durante el proceso.

La secuencia manual de eliminación
fue parcialmente abreviada debido
a la eliminación anticipada de registros.

La independencia de contextos y la
eliminación ordenada cuentan también
con verificación automatizada.

### 25.16. Verificaciones complementarias de HU-006

| Control | Resultado |
|---|---|
| Migración 004 principal | Aplicada |
| Migración 004 de pruebas | Aplicada |
| Integridad referencial | Verificada |
| Búsqueda SQL de categorías | Corregida y verificada |
| Controles internos de integración | 28/28 |
| Limpieza de integración | Completada |
| Respaldo preventivo | Generado |
| Restauración del respaldo | Pendiente |
| Backend v0.4.0 | Operativo |
| Frontend v0.4.0 | Operativo |
| Capturas esenciales | 5/5 revisadas |
| Validación móvil | Confirmada mediante emulación |
| Instalación limpia de cuatro migraciones | Pendiente |
| Idempotencia final | Pendiente |
| ESLint final | Pendiente |
| Compilación final | Pendiente |
| Limpieza de registros demostrativos | Pendiente de confirmación |

### 25.17. Lista de cierre de HU-006

- [x] Alcance funcional aprobado.
- [x] Respaldo preventivo de v0.3.0.
- [x] Migración 004 creada.
- [x] Migrador actualizado.
- [x] Base principal migrada.
- [x] Base de pruebas migrada.
- [x] Backend de CATEGORÍAS implementado.
- [x] Frontend de CATEGORÍAS implementado.
- [x] Integración con EDICIONES.
- [x] Indicadores jerárquicos.
- [x] Pruebas unitarias de categorías: 111/111.
- [x] Integración de categorías: 1/1.
- [x] Controles internos: 28/28.
- [x] Corrección de búsqueda SQL.
- [x] Regresión unitaria: 213/213.
- [x] Integraciones acumuladas: 4/4.
- [x] Total acumulado: 217/217.
- [x] Integridad referencial.
- [x] Validaciones funcionales realizadas.
- [x] Adaptación responsive mediante emulación.
- [x] Versionado de paquetes a 0.4.0.
- [x] Configuraciones internas actualizadas.
- [x] Backend principal reiniciado.
- [x] Frontend reiniciado.
- [x] Cinco capturas esenciales revisadas.
- [ ] Instalación limpia de migraciones.
- [ ] Idempotencia de las cuatro migraciones.
- [ ] ESLint final.
- [ ] Compilación de producción final.
- [ ] Verificación conjunta de versiones.
- [ ] Limpieza final de datos demostrativos.
- [ ] Consolidación documental.
- [ ] Verificación de archivos de capturas.
- [ ] Revisión de privacidad de evidencias.
- [ ] Auditoría final de archivos Git.
- [ ] CHECK integral.
- [ ] Aprobación formal.
- [ ] Commit.
- [ ] Publicación en GitHub.

### 25.18. Próximo incremento

La próxima historia de usuario prevista es:

**HU-007 — Identidad visual de competiciones**

No se iniciará su implementación
hasta finalizar formalmente
HU-006 y consolidar v0.4.0.

Las verificaciones pendientes fuera
del alcance actual permanecerán
registradas en el presente manual.

---

**ALTO-SISTEMA**

Sistema integral de gestión deportiva.