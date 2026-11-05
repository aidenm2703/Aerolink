const {DataTypes:D}=require('sequelize');
module.exports={id:'002-seguimiento',async up(sequelize){
 const qi=sequelize.getQueryInterface();
 // Las referencias a tablas v1 son lógicas: una FK nueva alteraría sus borrados previos.
 await qi.createTable('vinculos_usuario_cliente',{
  id:{type:D.INTEGER,primaryKey:true,autoIncrement:true},usuarioId:{type:D.INTEGER,allowNull:false,unique:true},clienteId:{type:D.INTEGER,allowNull:false},fecha:{type:D.DATE,allowNull:false,defaultValue:D.NOW}
 });
 await qi.createTable('perfiles_seguimiento',{
  id:{type:D.INTEGER,primaryKey:true,autoIncrement:true},paqueteId:{type:D.INTEGER,allowNull:false,unique:true},servicioId:{type:D.INTEGER,allowNull:true},transportistaId:{type:D.INTEGER,allowNull:true},sucursalDestinoId:{type:D.INTEGER,allowNull:true}
 });
 await qi.createTable('eventos_seguimiento',{
  id:{type:D.INTEGER,primaryKey:true,autoIncrement:true},codigo:{type:D.STRING,allowNull:false,unique:true},paqueteId:{type:D.INTEGER,allowNull:false},movimientoId:{type:D.INTEGER,allowNull:true,unique:true},etapa:{type:D.STRING,allowNull:false},fechaHora:{type:D.DATE,allowNull:false},detalle:{type:D.STRING,allowNull:false}
 });
}};
