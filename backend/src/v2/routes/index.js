const router = require('express').Router();
router.use(require('../../middlewares/authMiddleware'));
const c = require('../controllers/sucursalesController');
router.get('/sucursales', c.list);
router.get('/sucursales/:id', c.get);
router.use(require('./tracking'));
router.use(require('./agente'));
module.exports = router;


