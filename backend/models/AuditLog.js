const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  action: {
    type: DataTypes.ENUM(
      'CREATE_SECRET', 
      'UPDATE_SECRET', 
      'DELETE_SECRET', 
      'VIEW_SECRET',
      'VIEW_SECRETS',
      'SEARCH_SECRETS',
      'LOGIN',
      'LOGOUT'
    ),
    allowNull: false
  },
  resourceId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'createdAt']
    },
    {
      fields: ['action']
    }
  ]
});

module.exports = AuditLog;