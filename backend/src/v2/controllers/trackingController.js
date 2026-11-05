const {ok}=require('../../utils/responses');
const tracking=require('../services/tracking');
exports.get=async(req,res)=>ok(res,await tracking.rastrear(req.usuario.id,req.params.codigo));
