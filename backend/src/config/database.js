const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
const { Sequelize } = require('sequelize');
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, { logging: false })
  : new Sequelize({ dialect: 'sqlite', storage: process.env.DB_STORAGE || path.resolve(__dirname, '../../aerolink.sqlite'), logging: false });
module.exports = sequelize;
