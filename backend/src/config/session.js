const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { pool } = require('./database');

const DURACION_SESION = 24 * 60 * 60 * 1000;

const esProduccion = process.env.NODE_ENV === 'production';

if (!process.env.SESSION_SECRET ||
    process.env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET invalido o inexistente.');
}

const sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: DURACION_SESION,
    createDatabaseTable: true,
    endConnectionOnClose: false
}, pool);

const sessionMiddleware = session({
    name: 'alto.sid',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        httpOnly: true,
        secure: esProduccion,
        sameSite: 'lax',
        maxAge: DURACION_SESION,
        path: '/'
    }
});

module.exports = {
    sessionMiddleware,
    sessionStore
};