const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
const { Sequelize } = require('sequelize');
const dialect = process.env.DB_DIALECT || 'mysql';
const port = Number(process.env.DB_PORT || 3306);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('DB_PORT inválido.');
const common = { logging: false, pool: { max: 5, min: 0, acquire: 15000, idle: 10000 } };
let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, common);
} else if (dialect === 'sqlite') {
  const storage = process.env.DB_STORAGE || './aerolink.sqlite';
  sequelize = new Sequelize({ ...common, dialect, storage: storage === ':memory:' ? storage : path.resolve(__dirname, '../..', storage) });
} else if (dialect === 'mysql') {
  if (!process.env.DB_NAME || !process.env.DB_USER || process.env.DB_PASSWORD === undefined) throw new Error('Configura DB_NAME, DB_USER y DB_PASSWORD en backend/.env.');
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    ...common, dialect, host: process.env.DB_HOST || '127.0.0.1', port,
    dialectOptions: { connectTimeout: 10000 },
    define: { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
  });
} else {
  throw new Error('DB_DIALECT debe ser mysql o sqlite; usa DATABASE_URL para otro dialecto.');
}
module.exports = sequelize;
