const { APP_CONFIG } = require('./config/app.config');

const express = require('express');
const cors = require('cors');

const { pool, testConnection } = require('./config/database');
const { sessionMiddleware, sessionStore } = require('./config/session');
const { requireAuth } = require('./middlewares/auth');
const authRoutes = require('./routes/auth.routes');

const app = express();

const { nombre, version, servidor } = APP_CONFIG;

app.disable('x-powered-by');

app.use(cors({
    origin: servidor.frontendUrl,
    credentials: true
}));

app.use(express.json({
    limit: servidor.limiteJson
}));

// Proteccion de solicitudes que modifican datos
app.use((req, res, next) => {
    const metodosProtegidos = ['POST', 'PUT', 'PATCH', 'DELETE'];

    if (metodosProtegidos.includes(req.method)) {
        const origen = req.get('origin');

        if (origen !== servidor.frontendUrl) {
            return res.status(403).json({
                mensaje: 'Origen de solicitud no autorizado.'
            });
        }
    }

    next();
});

// Sesiones persistentes en MySQL
app.use(sessionMiddleware);

// Evitar almacenamiento en cache de respuestas privadas
app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

// Ruta publica del servidor
app.get('/', (req, res) => {
    res.json({
        sistema: nombre,
        version,
        mensaje: 'Servidor funcionando correctamente'
    });
});

// Estado de la infraestructura
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');

        res.json({
            sistema: nombre,
            version,
            backend: 'ONLINE',
            database: 'ONLINE'
        });

    } catch (error) {
        console.error(error.message);

        res.status(503).json({
            sistema: nombre,
            version,
            backend: 'ONLINE',
            database: 'OFFLINE'
        });
    }
});

// Rutas de autenticacion
app.use('/api/auth', authRoutes);

// Ruta privada de prueba
app.get('/api/privado', requireAuth, (req, res) => {
    res.json({
        mensaje: 'Acceso autorizado.',
        usuario: req.usuario
    });
});

// Rutas inexistentes
app.use((req, res) => {
    res.status(404).json({
        mensaje: 'Ruta no encontrada.'
    });
});

// Manejo general de errores
app.use((error, req, res, next) => {
    console.error(error.message);

    res.status(500).json({
        mensaje: 'Error interno del servidor.'
    });
});

// Inicio del servidor
async function startServer() {
    try {
        await testConnection();
        await sessionStore.onReady();

        app.listen(
            servidor.puerto,
            servidor.host,
            () => {
                console.log('================================');
                console.log(`${nombre} v${version}`);
                console.log(
                    `Servidor: http://${servidor.host}:${servidor.puerto}`
                );
                console.log(`Entorno: ${APP_CONFIG.entorno}`);
                console.log('Base de datos: ONLINE');
                console.log('Sesiones MySQL: ONLINE');
                console.log('Autenticacion: HABILITADA');
                console.log('================================');
            }
        );

    } catch (error) {
        console.error('Error al iniciar el servidor:');
        console.error(error.message);

        await pool.end();
        process.exit(1);
    }
}

startServer();