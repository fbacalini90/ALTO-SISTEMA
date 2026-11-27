const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./config/database');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        sistema: 'ALTO-SISTEMA',
        version: '0.1.0',
        mensaje: 'Servidor funcionando correctamente'
    });
});

app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');

        res.json({
            sistema: 'ALTO-SISTEMA',
            version: '0.1.0',
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

async function startServer() {
    try {
        await testConnection();

        app.listen(PORT, '127.0.0.1', () => {
            console.log('================================');
            console.log('ALTO-SISTEMA v0.1.0');
            console.log('Servidor: http://localhost:' + PORT);
            console.log('Base de datos: ONLINE');
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