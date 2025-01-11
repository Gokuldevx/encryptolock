const { Op } = require('sequelize');
const AuditLog = require('../models/AuditLog');

class AuditService {
  static async logAction(options) {
    const {
      userId,
      action,
      resourceId = null,
      metadata = {},
      req
    } = options;

    try {
      // Extract IP Address
      const ipAddress = req.ip || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress ||
        req.headers['x-forwarded-for'];

      // Prepare metadata
      const auditMetadata = {
        ...metadata,
        userAgent: req.get('User-Agent'),
        ipAddress
      };

      // Create Audit Log
      return AuditLog.create({
        userId,
        action,
        resourceId,
        metadata: auditMetadata,
        ipAddress
      });
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Optionally, you can choose to not throw an error 
      // to prevent audit logging from breaking the main flow
      return null;
    }
  }

  // Retrieve Audit Logs
  static async getUserAuditLogs(userId, options = {}) {
    const { 
      limit = 50, 
      offset = 0, 
      startDate, 
      endDate 
    } = options;

    const whereConditions = { userId };

    // Add date filtering if start and end dates are provided
    if (startDate && endDate) {
      whereConditions.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    return AuditLog.findAndCountAll({
      where: whereConditions,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  // Optional: Method to clean up old audit logs
  static async cleanupOldLogs(retentionDays = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    return AuditLog.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate
        }
      }
    });
  }
}

module.exports = AuditService;