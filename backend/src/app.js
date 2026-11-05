const express = require('express');
require('./config/database');
const app = express();
app.use(require('cors')({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));
app.use('/api/v2', require('./v2/routes'));
app.use('/api', require('./routes'));
app.use((req, res) => res.status(404).json({ ok: false, message: 'Ruta no encontrada.', errors: [] }));
app.use(require('./middlewares/errors'));
module.exports = app;

