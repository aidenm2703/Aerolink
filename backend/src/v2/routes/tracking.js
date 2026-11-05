const router=require('express').Router();
router.get('/tracking/:codigo',require('../controllers/trackingController').get);
module.exports=router;
