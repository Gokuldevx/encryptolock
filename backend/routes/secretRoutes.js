const express = require('express');
const router = express.Router();
const { 
  ValidationError, 
  UnauthorizedError,
  NotFoundError
} = require('../middleware/errorHandler');
const authMiddleware = require('../middleware/authMiddleware');
const SecretService = require('../services/secretService');
const AuditService = require('../services/auditService');

// Middleware to wrap async routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Input Validation Middleware
const validateSecretInput = (req, res, next) => {
  try {
    const { name, value, category } = req.body;

    // Check for required fields
    if (!name) {
      throw new ValidationError('Secret name is required');
    }

    if (!value) {
      throw new ValidationError('Secret value is required');
    }

    // Optional: Add more specific validations
    if (name.length > 100) {
      throw new ValidationError('Secret name must be less than 100 characters');
    }

    // Optional: Validate category
    const validCategories = ['PASSWORD', 'API_KEY', 'NOTE', 'OTHER'];
    if (category && !validCategories.includes(category)) {
      throw new ValidationError(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Create Secret Route
const createSecret = asyncHandler(async (req, res) => {
  // Ensure user is authenticated
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  // Create Secret
  const secret = await SecretService.createSecret(
    req.user.id, 
    req.body
  );

  // Log Audit Trail
  await AuditService.logAction({
    userId: req.user.id,
    action: 'CREATE_SECRET',
    resourceId: secret.id,
    metadata: {
      secretName: req.body.name,
      category: req.body.category
    },
    req
  });

  res.status(201).json({
    success: true,
    secret: {
      id: secret.id,
      name: secret.name,
      category: secret.category,
      createdAt: secret.createdAt
    }
  });
});

// List Secrets Route
const listSecrets = asyncHandler(async (req, res) => {
  // Pagination support
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const { count, rows: secrets } = await SecretService.listSecrets(
    req.user.id, 
    { limit, offset }
  );

  // Log Audit Trail
  await AuditService.logAction({
    userId: req.user.id,
    action: 'VIEW_SECRETS',
    metadata: {
      secretCount: count,
      page,
      limit
    },
    req
  });

  res.json({
    success: true,
    secrets,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  });
});

// Get Single Secret Route
const getSingleSecret = asyncHandler(async (req, res) => {
  const secret = await SecretService.getSecretById(
    req.user.id, 
    req.params.id
  );

  if (!secret) {
    throw new NotFoundError('Secret not found');
  }

  // Log Audit Trail
  await AuditService.logAction({
    userId: req.user.id,
    action: 'VIEW_SECRET',
    resourceId: req.params.id,
    req
  });

  res.json({
    success: true,
    secret: {
      id: secret.id,
      name: secret.name,
      category: secret.category,
      createdAt: secret.createdAt
    }
  });
});

// Update Secret Route
const updateSecret = asyncHandler(async (req, res) => {
  const updatedSecret = await SecretService.updateSecret(
    req.user.id, 
    req.params.id, 
    req.body
  );

  // Log Audit Trail
  await AuditService.logAction({
    userId: req.user.id,
    action: 'UPDATE_SECRET',
    resourceId: req.params.id,
    metadata: {
      secretName: req.body.name,
      category: req.body.category
    },
    req
  });

  res.json({
    success: true,
    secret: {
      id: updatedSecret.id,
      name: updatedSecret.name,
      category: updatedSecret.category,
      updatedAt: updatedSecret.updatedAt
    }
  });
});

// Delete Secret Route
const deleteSecret = asyncHandler(async (req, res) => {
  await SecretService.deleteSecret(
    req.user.id, 
    req.params.id
  );

  // Log Audit Trail
  await AuditService.logAction({
    userId: req.user.id,
    action: 'DELETE_SECRET',
    resourceId: req.params.id,
    req
  });

  res.json({
    success: true,
    message: 'Secret deleted successfully'
  });
});

// Search Secrets Route
const searchSecrets = asyncHandler(async (req, res) => {
  const { query, category } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const { count, rows: secrets } = await SecretService.searchSecrets(
    req.user.id, 
    { query, category, limit, offset }
  );

  // Log Audit Trail
  await AuditService.logAction({
    userId: req.user.id,
    action: 'SEARCH_SECRETS',
    metadata: {
      query,
      category,
      resultCount: count
    },
    req
  });

  res.json({
    success: true,
    secrets,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  });
});

// Define Routes
router.post('/create', authMiddleware, validateSecretInput, createSecret);
router.get('/', authMiddleware, listSecrets);
router.get('/:id', authMiddleware, getSingleSecret);
router.put('/:id', authMiddleware, validateSecretInput, updateSecret);
router.delete('/:id', authMiddleware, deleteSecret);
router.get('/search', authMiddleware, searchSecrets);

module.exports = router;