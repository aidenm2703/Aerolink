const router = require('express').Router();
const c = require('../controllers/crud')('casilleros');
router.get('/', c.list); router.post('/', c.save);
router.get('/:id', c.get); router.put('/:id', c.save); router.delete('/:id', c.remove);
module.exports = router;
