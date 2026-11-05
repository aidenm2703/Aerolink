const { DataTypes: D } = require('sequelize');
const bcrypt = require('bcryptjs');
module.exports = sequelize => {
  const Usuario = sequelize.define('usuarios', {
    nombre: { type: D.STRING, allowNull: false, validate: { notEmpty: true, len: [1, 255] } },
    correo: { type: D.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: D.STRING, allowNull: false },
    fechaCreacion: { type: D.DATE, allowNull: false, defaultValue: D.NOW },
    tokenVersion: { type: D.INTEGER, allowNull: false, defaultValue: 0 }
  }, { timestamps: false, freezeTableName: true,
    defaultScope: { attributes: { exclude: ['password', 'tokenVersion'] } },
    hooks: { beforeSave: async user => {
      if (user.changed('password')) user.password = await bcrypt.hash(user.password, 12);
      if (!user.isNewRecord && (user.changed('password') || user.changed('correo'))) user.tokenVersion += 1;
    } }
  });
  Usuario.prototype.toJSON = function () { const data = { ...this.get() }; delete data.password; delete data.tokenVersion; return data; };
  return Usuario;
};

