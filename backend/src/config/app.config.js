const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '../../.env'),
    quiet: true
});

const APP_CONFIG = Object.freeze({

    nombre: 'ALTO-SISTEMA',

    version: '0.2.0',

    entorno: process.env.NODE_ENV || 'development',

    servidor: Object.freeze({

        puerto: Number(process.env.PORT || 3000),

        host: process.env.HOST || '127.0.0.1',

        frontendUrl:
            process.env.FRONTEND_URL ||
            'http://localhost:5173',

        limiteJson: '100kb'

    }),

    regional: Object.freeze({

        idioma: 'es-AR',

        zonaHoraria: 'America/Argentina/Cordoba'

    })

});

module.exports = { APP_CONFIG };