# ALTO-SISTEMA — Manual de mantenimiento

Version de referencia: 0.1.3

## 1. Objetivo

Establecer procedimientos de mantenimiento
que permitan garantizar la continuidad operativa,
la integridad de los datos y la recuperacion
del sistema ante posibles fallos.

## 2. Entorno de desarrollo

- Windows 11.
- Visual Studio Code.
- PowerShell.
- Node.js.
- npm.
- MySQL 8.
- Git.

## 3. Servicios del sistema

Frontend:
    http://localhost:5173

Backend:
    http://localhost:3000

Base de datos:
    alto_sistema

Servicio de Windows:
    MySQL80

## 4. Inicio del sistema

### 4.1. Verificar MySQL

Desde PowerShell:

```powershell
Get-Service MySQL80
```

Si el servicio esta detenido, ejecutar desde
PowerShell con permisos de administrador:

```powershell
Start-Service MySQL80
```

### 4.2. Iniciar el backend

Desde la raiz del proyecto:

```powershell
cd backend
npm start
```

Mantener la terminal abierta.

### 4.3. Iniciar el frontend

Desde otra terminal ubicada en la raiz:

```powershell
cd frontend
npm run dev
```

Mantener la terminal abierta.

### 4.4. Acceder a la aplicacion

Abrir el navegador en:

http://localhost:5173/

## 5. Organizacion de terminales

Se recomienda utilizar tres terminales:

- Terminal del backend.
- Terminal del frontend.
- Terminal de comandos y mantenimiento.

No ejecutar comandos de mantenimiento
en terminales ocupadas por servidores activos.

## 6. Detencion del sistema

Para detener los servidores, utilizar Ctrl + C
en sus respectivas terminales.

El cierre de VS Code no elimina los datos
persistidos en MySQL.

Antes de cerrar el proyecto, comprobar
que los archivos hayan sido guardados.

Si existe un incremento aprobado, verificar
que haya sido versionado mediante Git.

## 7. Configuracion

### Frontend

Archivo:

frontend/src/config/app.config.js

Variable de entorno disponible:

VITE_API_URL

### Backend

Archivo:

backend/src/config/app.config.js

Variables de configuracion:

- NODE_ENV
- PORT
- HOST
- FRONTEND_URL

### Configuracion de MySQL

Archivo:

backend/.env

Variables:

- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME

### Sesiones

Variable:

SESSION_SECRET

Los archivos con credenciales reales no deben
incorporarse al repositorio Git.

## 8. Comandos de mantenimiento

Desde la carpeta backend:

```powershell
npm start
```

Inicia el servidor.

```powershell
npm test
```

Ejecuta las pruebas automatizadas habilitadas.

```powershell
npm run migrate
```

Ejecuta las migraciones pendientes.

```powershell
npm run create-admin
```

Permite crear el administrador inicial.

La creacion inicial requiere las variables
ADMIN_USER y ADMIN_PASSWORD.

No debe ejecutarse para cambiar la contraseña
de un administrador existente.

## 9. Verificacion de infraestructura

Consultar:

http://localhost:3000/api/health

La respuesta correcta debera indicar:

- Backend: ONLINE.
- Database: ONLINE.
- Version correspondiente del sistema.

El panel principal tambien muestra
el estado de la infraestructura.

La comprobacion del panel se realiza
al ingresar a dicha pantalla.

No constituye un sistema de monitoreo continuo.

## 10. Migraciones de base de datos

Ubicacion:

database/migrations/

Convencion de nombres:

001_usuarios.sql
002_nombre_migracion.sql
003_nombre_migracion.sql

Las migraciones deben:

- Poseer una numeracion correlativa.
- Estar versionadas mediante Git.
- Contener una sentencia SQL por archivo.
- Incorporar verificaciones estructurales.
- Preservar los datos existentes.
- Evaluar posibles efectos sobre otras entidades.

Las migraciones aplicadas no deben modificarse.

Toda correccion estructural posterior debera
realizarse mediante una nueva migracion.

## 11. Registro de migraciones

Tabla:

schema_migrations

Informacion registrada:

- Version.
- Nombre del archivo.
- Checksum SHA-256.
- Estado.
- Fecha de inicio.
- Fecha de aplicacion.

Estados:

EN_PROCESO:
    Migracion iniciada y no completada.

APLICADA:
    Migracion ejecutada y verificada.

El migrador detecta modificaciones de archivos,
versiones faltantes y ejecuciones incompletas.

Tambien utiliza un bloqueo de MySQL para impedir
ejecuciones simultaneas del migrador.

El bloqueo no sustituye la detencion del backend
durante modificaciones estructurales importantes.

## 12. Procedimiento de actualizacion

1. Revisar los cambios previstos.
2. Generar una copia de seguridad.
3. Verificar la existencia del respaldo.
4. Detener el backend.
5. Ejecutar las migraciones pendientes.
6. Comprobar el resultado.
7. Ejecutar nuevamente el migrador para comprobar
   que no existan migraciones pendientes.
8. Iniciar el backend.
9. Ejecutar las pruebas correspondientes.
10. Realizar el CHECK integral.

Si una migracion falla, no repetirla
indiscriminadamente.

Debera revisarse el estado de la base de datos
y el registro schema_migrations.

Las operaciones DDL de MySQL pueden generar
confirmaciones implicitas de transacciones.

Por ese motivo, no se debe asumir que una
migracion fallida no produjo modificaciones.

## 13. Copias de seguridad

Los respaldos locales se almacenaran en:

%LOCALAPPDATA%\ALTO-SISTEMA\backups

Los archivos de respaldo deben permanecer
fuera del repositorio Git.

Pueden contener:

- Datos personales.
- Hashes de contraseñas.
- Sesiones.
- Resultados deportivos.
- Informacion disciplinaria.

Deberan protegerse contra accesos no autorizados.

## 14. Generar una copia de seguridad

Desde PowerShell:

```powershell
$carpeta = Join-Path $env:LOCALAPPDATA "ALTO-SISTEMA\backups"

New-Item -ItemType Directory -Force -Path $carpeta | Out-Null

$fecha = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

$backup = Join-Path $carpeta "alto_sistema_$fecha.sql"

& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" --single-transaction --no-tablespaces --set-gtid-purged=OFF -u pancho -p --result-file="$backup" alto_sistema

if ($LASTEXITCODE -eq 0) {
    Get-Item -LiteralPath $backup | Format-List FullName, Length
} else {
    Write-Host "ERROR AL GENERAR LA COPIA DE SEGURIDAD"
}
```

La contraseña debe introducirse cuando
MySQL la solicite.

No debe escribirse directamente en el comando.

No realizar cambios estructurales simultaneos
mientras se genera el respaldo.

## 15. Verificacion de respaldos

Comprobar:

- Finalizacion correcta de mysqldump.
- Existencia del archivo.
- Tamaño superior a cero.
- Fecha de generacion.
- Ubicacion segura.
- Posibilidad real de restauracion.

La existencia de un archivo no garantiza
por si sola que pueda restaurarse correctamente.

## 16. Ensayo de restauracion

La restauracion de prueba debera realizarse
sobre una base de datos independiente.

Nombre utilizado:

alto_sistema_restore_test

Procedimiento:

1. Identificar el respaldo correspondiente.
2. Verificar que la base de prueba no exista.
3. Crear la base de prueba.
4. Restaurar el archivo SQL.
5. Verificar las tablas restauradas.
6. Comprobar la cantidad de registros.
7. Comparar los datos relevantes.
8. Confirmar la integridad referencial.
9. Eliminar exclusivamente la base temporal.

Nunca realizar un ensayo de restauracion
directamente sobre la base operativa.

En v0.1.3 se comprobo exitosamente la restauracion
del respaldo anterior a la primera migracion.

El registro restaurado del administrador
coincidio con el registro original.

La base temporal fue eliminada posteriormente.

## 17. Restauracion de emergencia

Ante una perdida o corrupcion de datos:

1. Detener las operaciones de escritura.
2. Detener el backend.
3. Preservar la base afectada cuando sea posible.
4. Identificar el ultimo respaldo valido.
5. Ensayar su restauracion en una base independiente.
6. Determinar la version compatible del sistema.
7. Evaluar las migraciones necesarias.
8. Verificar los datos recuperados.
9. Autorizar expresamente la recuperacion operativa.
10. Ejecutar las pruebas de regresion.

No eliminar la base operativa antes de comprobar
la recuperacion de los datos.

Este procedimiento debera adaptarse
al incidente concreto.

## 18. Pruebas unitarias

Desde backend:

```powershell
npm test
```

Las pruebas unitarias de autenticacion
utilizan repositorios simulados.

No modifican la base de datos operativa.

Las pruebas de integracion permanecen
deshabilitadas salvo activacion expresa.

## 19. Pruebas de integracion

Requisitos:

- MySQL activo.
- Backend iniciado.
- Administrador existente.
- Credenciales validas.
- Entorno local controlado.

Desde backend:

```powershell
$env:ALTO_INTEGRATION_TEST = "1"
$env:ALTO_TEST_USER = "pancho"

$clave = Read-Host "Contraseña de acceso a ALTO-SISTEMA" -AsSecureString

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

La contraseña solicitada corresponde
al acceso a ALTO-SISTEMA, no a MySQL.

Las credenciales se utilizan temporalmente
y no deben almacenarse en el repositorio.

Resultado comprobado en v0.1.3:

- 13 pruebas unitarias aprobadas.
- 1 prueba de integracion aprobada.
- 14 pruebas aprobadas en total.
- 0 pruebas fallidas.

## 20. Auditoria de dependencias

Desde backend o frontend:

```powershell
npm audit
```

Las vulnerabilidades detectadas deberan
evaluarse antes de modificar dependencias.

No ejecutar actualizaciones forzadas
sin analizar sus posibles consecuencias.

Despues de actualizar dependencias,
ejecutar las pruebas correspondientes.

## 21. Control de versiones

Desde la raiz del proyecto:

```powershell
git status
```

Consultar los archivos modificados.

```powershell
git diff
```

Revisar cambios no preparados.

```powershell
git diff --cached
```

Revisar cambios preparados para el commit.

```powershell
git log --oneline
```

Consultar el historial de versiones.

Los commits deben realizarse despues
de aprobar el CHECK integral.

No ejecutar operaciones destructivas de Git
sin evaluar previamente sus consecuencias.

## 22. Resolucion de problemas frecuentes

### ERR_CONNECTION_REFUSED

Verificar que el frontend y el backend
esten ejecutandose en los puertos previstos.

### Error de conexion con MySQL

Verificar:

- Estado del servicio MySQL80.
- Configuracion del backend.
- Credenciales.
- Existencia de la base de datos.

### Puerto ocupado

Consultar desde PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen
```

Identificar el proceso antes de detenerlo.

### Inicio de sesion rechazado

Verificar las credenciales de ALTO-SISTEMA.

Si se alcanzo el limite de intentos,
aguardar el plazo establecido.

### Migracion incompleta

Detener nuevas actualizaciones.

Revisar schema_migrations, la estructura
resultante y el respaldo correspondiente.

### Caracteres incorrectos en PowerShell

Consultar archivos de codigo mediante:

```powershell
Get-Content ruta_del_archivo -Encoding UTF8
```

Los archivos del proyecto deben guardarse
con codificacion UTF-8.

## 23. Seguridad de mantenimiento

- No compartir contraseñas.
- No publicar respaldos.
- No incorporar archivos .env a Git.
- No modificar datos deportivos directamente
  sin un procedimiento autorizado.
- No eliminar tablas o bases de datos
  sin identificar expresamente su alcance.
- No utilizar datos reales en pruebas destructivas.
- Aplicar el principio de minimo privilegio.

Las credenciales de desarrollo deberan rotarse
antes del despliegue en produccion.

## 24. Mantenimiento futuro

Quedan pendientes de implementacion:

- Respaldos automaticos.
- Politica de retencion de respaldos.
- Copias externas protegidas.
- Monitoreo de disponibilidad.
- Registro centralizado de errores.
- Pruebas automatizadas del frontend.
- Pruebas de rendimiento.
- Procedimientos de despliegue.
- Recuperacion automatizada.
- Auditoria de operaciones deportivas.

Estas funcionalidades se incorporaran
en los incrementos correspondientes.

## 25. Actualizacion del manual

Este documento debera mantenerse actualizado
junto con el codigo fuente.

Todo cambio relevante en los procedimientos
de mantenimiento debera quedar documentado
y versionado mediante Git.