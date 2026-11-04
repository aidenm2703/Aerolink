const router = require('express').Router();
const { sequelize, models } = require('../models');
const { ok } = require('../utils/responses');
router.get('/health', async (req, res) => { await sequelize.authenticate(); ok(res, { status: 'ok', database: 'connected' }); });
router.get('/resumen', async (req, res) => { const counts = await Promise.all(Object.entries(models).map(async ([name, model]) => [name, await model.count()])); ok(res, Object.fromEntries(counts)); });
for (const name of Object.keys(models)) router.use('/' + name, require('./' + name));
module.exports = router;
