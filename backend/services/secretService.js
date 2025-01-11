const { Op } = require('sequelize');
const Secret = require('../models/Secret');
const { 
  ValidationError, 
  NotFoundError 
} = require('../middleware/errorHandler');
const crypto = require('crypto');

class SecretService {
  // Encryption Utility Methods
  static generateSalt() {
    return crypto.randomBytes(16).toString('hex');
  }

  static encryptValue(value, masterKey) {
    try {
      // Generate a unique salt for each encryption
      const salt = this.generateSalt();
      
      // Derive a key using PBKDF2
      const key = crypto.pbkdf2Sync(
        masterKey, 
        salt, 
        100000, 
        32, 
        'sha256'
      );

      // Use AES-256-GCM for encryption
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
      
      let encrypted = cipher.update(value, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get the authentication tag
      const authTag = cipher.getAuthTag();

      // Return a combined string of salt, iv, authTag, and encrypted value
      return `${salt}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error('Encryption failed: ' + error.message);
    }
  }

  static decryptValue(encryptedData, masterKey) {
    try {
      // Split the encrypted data
      const [salt, ivHex, authTagHex, encryptedValue] = encryptedData.split(':');
      
      // Derive the key using the same method as encryption
      const key = crypto.pbkdf2Sync(
        masterKey, 
        salt, 
        100000, 
        32, 
        'sha256'
      );

      // Prepare decryption components
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      // Create decryption cipher
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);

      // Decrypt the value
      let decrypted = decipher.update(encryptedValue, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  // Create Secret
  static async createSecret(userId, secretData) {
    // Validate input
    this.validateSecretInput(secretData);

    // Encrypt secret value
    const encryptedValue = this.encryptValue(
      secretData.value, 
      process.env.DATABASE_ENCRYPTION_KEY
    );

    try {
      return await Secret.create({
        userId,
        name: secretData.name,
        encryptedValue,
        category: secretData.category || 'OTHER'
      });
    } catch (error) {
      throw new ValidationError(`Failed to create secret: ${error.message}`);
    }
  }

  // List Secrets with Pagination and Filtering
  static async listSecrets(userId, options = {}) {
    const { 
      limit = 10, 
      offset = 0, 
      category,
      search 
    } = options;

    const whereConditions = { userId };

    // Optional category filter
    if (category) {
      whereConditions.category = category;
    }

    // Optional search filter
    if (search) {
      whereConditions.name = {
        [Op.like]: `%${search}%`
      };
    }

    return Secret.findAndCountAll({
      where: whereConditions,
      attributes: ['id', 'name', 'category', 'createdAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  // Get Secret by ID
  static async getSecretById(userId, secretId) {
    const secret = await Secret.findOne({
      where: { 
        id: secretId, 
        userId 
      }
    });

    if (!secret) {
      throw new NotFoundError('Secret not found');
    }

    return secret;
  }

  // Update Secret
  static async updateSecret(userId, secretId, updateData) {
    // Validate input
    this.validateSecretInput(updateData);

    // Find the secret
    const secret = await Secret.findOne({
      where: { id: secretId, userId }
    });

    if (!secret) {
      throw new NotFoundError('Secret not found');
    }

    // Prepare update data
    const updatePayload = {
      name: updateData.name,
      category: updateData.category || secret.category
    };

    // Re-encrypt if value is provided
    if (updateData.value) {
      updatePayload.encryptedValue = this.encryptValue(
        updateData.value, 
        process.env.DATABASE_ENCRYPTION_KEY
      );
    }

    // Update the secret
    return secret.update(updatePayload);
  }

  // Delete Secret
  static async deleteSecret(userId, secretId) {
    const secret = await Secret.findOne({
      where: { id: secretId, userId }
    });

    if (!secret) {
      throw new NotFoundError('Secret not found');
    }

    await secret.destroy();
    return true;
  }

  // Search Secrets
  static async searchSecrets(userId, options = {}) {
    const { 
      query, 
      category, 
      limit = 10, 
      offset = 0 
    } = options;

    const whereConditions = { userId };

    // Add category filter if provided
    if (category) {
      whereConditions.category = category;
    }

    // Add search query if provided
    if (query) {
      whereConditions.name = {
        [Op.like]: `%${query}%`
      };
    }

    return Secret.findAndCountAll({
      where: whereConditions,
      attributes: ['id', 'name', 'category', 'createdAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  // Input Validation
  static validateSecretInput(secretData) {
    // Check for required fields
    if (!secretData.name) {
      throw new ValidationError('Secret name is required');
    }

    if (!secretData.value) {
      throw new ValidationError('Secret value is required');
    }

    // Validate name length
    if (secretData.name.length > 100) {
      throw new ValidationError('Secret name must be less than 100 characters');
    }

    // Validate category
    const validCategories = ['PASSWORD', 'API_KEY', 'NOTE', 'OTHER'];
    if (secretData.category && !validCategories.includes(secretData.category)) {
      throw new ValidationError(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }
  }
}

module.exports = SecretService;