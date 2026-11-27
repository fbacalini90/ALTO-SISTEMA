const express = require('express');
const cors = require('cors');

const { pool, testConnection } = require('./config/database');
const { sessionMiddleware, sessionStore } = require('./config/session');
const { requireAuth } = require('./middlewares/auth');
const authRoutes = require('./routes/auth.routes');

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.disable('x-powered-by');

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));

app.use(express.json({ limit: '100kb' }));

// Proteccion de solicitudes que modifican datos
app.use((req, res, next) => {
    const metodosProtegidos = ['POST', 'PUT', 'PATCH', 'DELETE'];

    if (metodosProtegidos.includes(req.method)) {
        const origen = req.get('origin');

        if (origen !== FRONTEND_URL) {
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
        sistema: 'ALTO-SISTEMA',
        version: '0.1.1',
        mensaje: 'Servidor funcionando correctamente'
    });
});

// Estado de la infraestructura
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');

        res.json({
            sistema: 'ALTO-SISTEMA',
            version: '0.1.1',
            backend: 'ONLINE',
            database: 'ONLINE'
        });

    } catch (error) {
        console.error(error.message);

        res.status(503).json({
            sistema: 'ALTO-SISTEMA',
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

        app.listen(PORT, '127.0.0.1', () => {
            console.log('================================');
            console.log('ALTO-SISTEMA v0.1.1');
            console.log('Servidor: http://localhost:' + PORT);
            console.log('Base de datos: ONLINE');
            console.log('Sesiones MySQL: ONLINE');
            console.log('Autenticacion: HABILITADA');
            console.log('================================');
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:');
        console.error(error.message);

        await pool.end();
        process.exit(1);
    }
}

startServer();