const {DataTypes:D}=require('sequelize');
const {sequelize}=require('../../models');
const options={timestamps:false,freezeTableName:true};
const Vinculo=sequelize.define('vinculos_usuario_cliente',{usuarioId:{type:D.INTEGER,allowNull:false,unique:true},clienteId:{type:D.INTEGER,allowNull:false},fecha:{type:D.DATE,allowNull:false,defaultValue:D.NOW}},options);
const Perfil=sequelize.define('perfiles_seguimiento',{paqueteId:{type:D.INTEGER,allowNull:false,unique:true},servicioId:{type:D.INTEGER,allowNull:true},transportistaId:{type:D.INTEGER,allowNull:true},sucursalDestinoId:{type:D.INTEGER,allowNull:true}},options);
const Evento=sequelize.define('eventos_seguimiento',{codigo:{type:D.STRING,allowNull:false,unique:true},paqueteId:{type:D.INTEGER,allowNull:false},movimientoId:{type:D.INTEGER,allowNull:true,unique:true},etapa:{type:D.STRING,allowNull:false},fechaHora:{type:D.DATE,allowNull:false},detalle:{type:D.STRING,allowNull:false}},options);
module.exports={Vinculo,Perfil,Evento};
