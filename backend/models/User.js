const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ethereumAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isLowercase: true
    }
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['ethereumAddress']
    }
  ]
});

module.exports = User;