// models/Secret.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Secret = sequelize.define('Secret', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  encryptedValue: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('PASSWORD', 'API_KEY', 'NOTE', 'OTHER'),
    defaultValue: 'OTHER'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'secrets',
  timestamps: true
});

module.exports = Secret;