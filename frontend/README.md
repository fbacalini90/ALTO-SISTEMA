# ALTO-SISTEMA — Frontend

Interfaz web administrativa del sistema integral de gestión deportiva.

- Versión de ALTO-SISTEMA: **0.3.0**.
- Sistema de Diseño: **1.0**.
- Incremento actual: HU-005 — Gestión de ediciones.
- Estado: implementación verificada, pendiente de aprobación integral y consolidación.

## 1. Tecnologías

- React y React Router.
- Vite.
- JavaScript y CSS.
- Lucide React.
- Fontsource (Barlow Condensed e Inter).
- ESLint.

## 2. Instalación y ejecución local

Requisitos: Node.js 24 LTS, npm y backend de ALTO-SISTEMA configurado con MySQL.

Desde el directorio `frontend`:

```powershell
npm ci
npm run dev
```

Acceso habitual: http://localhost:5173

El backend principal deberá estar disponible en http://localhost:3000.
Consultar el [manual de mantenimiento](../docs/MANTENIMIENTO.md) para preparar la base de datos, aplicar migraciones y crear el administrador inicial.

## 3. Configuración de la API

La URL predeterminada de la API es `http://localhost:3000/api`.
Puede configurarse mediante la variable de entorno de Vite:

```env
VITE_API_URL=http://localhost:3000/api
```

La configuración general se encuentra en `src/config/app.config.js`.
No incorporar contraseñas, secretos ni credenciales en las variables del frontend: sus valores pueden quedar expuestos al navegador.

## 4. Organización

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── config/
│   ├── layouts/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Login.css
│   │   ├── Dashboard.jsx
│   │   ├── Dashboard.css
│   │   ├── ModuloPendiente.jsx
│   │   ├── ModuloPendiente.css
│   │   ├── Torneos.jsx
│   │   ├── Torneos.css
│   │   ├── Ediciones.jsx
│   │   └── Ediciones.css
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── typography.css
│   │   └── components.css
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
├── package-lock.json
└── README.md
```

La comunicación HTTP se centraliza en `src/services/api.js`, con inclusión de credenciales de sesión, tratamiento de errores y soporte de cancelación de solicitudes.
Las validaciones de la interfaz no sustituyen los controles de autenticación, origen e integridad del backend.

## 5. Funcionalidades disponibles

| Pantalla | Responsabilidad |
|---|---|
| Acceso privado | Autenticación y acceso administrativo |
| Dashboard | Indicadores y accesos rápidos |
| TORNEOS | Creación, consulta, edición, archivado, reactivación y eliminación |
| EDICIONES | Administración de las ediciones de un torneo |
| Módulos pendientes | Pantallas provisionales identificadas |

### Gestión de EDICIONES — HU-005

La pantalla se accede desde la tarjeta del torneo correspondiente, sin agregar un módulo independiente al menú lateral.

Ruta privada: `/torneos/:torneoId/ediciones`.

- Indicadores de cantidad total, planificadas, en curso y finalizadas.
- Búsqueda por nombre y descripción y filtrado por estado.
- Nombre obligatorio y descripción opcional.
- Fechas de inicio y finalización opcionales, editables y eliminables.
- Transiciones manuales: PLANIFICADA → EN_CURSO → FINALIZADA; reapertura a EN_CURSO.
- Confirmación de operaciones de cambio de estado y eliminación.
- Identificación del torneo seleccionado y retorno a TORNEOS.
- Indicadores de ediciones totales y en curso en las tarjetas de TORNEOS.
- Estados de carga, error, ausencia de registros y búsqueda sin coincidencias.

Los torneos archivados permiten consultar, editar, finalizar y eliminar ediciones sin dependencias, pero no crear, iniciar ni reabrir ediciones. Las restricciones definitivas se aplican en el backend.
Las fechas no modifican automáticamente el estado deportivo. Las categorías y el selector general de contexto deportivo permanecen pendientes.

## 6. Sistema de Diseño

Se mantiene el Sistema de Diseño v1.0, incorporado durante HU-004:

- Identidad institucional oscura y azul eléctrico `#3333FF`.
- Barlow Condensed para encabezados e Inter para la interfaz.
- Design Tokens centralizados y componentes CSS reutilizables con prefijo `as-`.
- Estados de EDICIONES identificados con texto y color: planificada (azul), en curso (verde) y finalizada (gris).
- Distribución responsive y acciones destructivas diferenciadas.

Los estilos particulares de EDICIONES se encuentran en `src/pages/Ediciones.css`.
La identidad institucional es independiente de las futuras identidades visuales de las competiciones.

## 7. Comandos de desarrollo

Ejecutar desde `frontend`:

| Comando | Responsabilidad |
|---|---|
| `npm ci` | Instalación reproducible de dependencias |
| `npm run dev` | Servidor de desarrollo |
| `npm run lint` | Análisis estático |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run preview` | Vista previa local de la compilación |

No versionar `node_modules/`, `dist/` ni archivos privados de entorno.
La vista previa de Vite no constituye un despliegue de producción.

## 8. Verificaciones de HU-005

- ESLint: ejecución satisfactoria, sin errores informados.
- Compilación de producción: exitosa (2,52 s en el entorno local).
- Validación funcional y responsive: 17/17 controles confirmados durante HU-005, incluyendo comprobaciones integradas con el backend.
- Simulación móvil en navegador: 390 × 844 px, confirmada por el administrador.
- Pruebas automatizadas del backend: 105/105, acumuladas mediante ejecuciones separadas.

Las ejecuciones de lint, build y pruebas automatizadas precedieron al cambio de numeración a 0.3.0. La coherencia de versiones y los reinicios de los servidores principales se verificaron posteriormente. Los resultados del backend no constituyen pruebas automatizadas de la interfaz.

Permanecen pendientes las pruebas automatizadas del frontend, las pruebas visuales automatizadas, la validación en dispositivos físicos y la auditoría formal de accesibilidad. El CHECK integral y la consolidación mediante Git de HU-005 aún no se completaron.

## 9. Documentación oficial

- [README principal](../README.md)
- [Arquitectura](../docs/ARQUITECTURA.md)
- [Normas de desarrollo](../docs/DESARROLLO.md)
- [Manual de mantenimiento](../docs/MANTENIMIENTO.md)
- [Modelo multitorneo](../docs/MODELO_MULTITORNEO.md)
- [Sistema de Diseño](../docs/SISTEMA_DE_DISENO.md)

La documentación principal constituye la referencia para las reglas deportivas y operativas. Este README describe exclusivamente el frontend y no modifica las decisiones de negocio aprobadas.

---

**ALTO-SISTEMA | Tecnología aplicada al fútbol amateur.**
