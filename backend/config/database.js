const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || './database/encryptolock.db',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    freezeTableName: true
  }
});

module.exports = sequelize;