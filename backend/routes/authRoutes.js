const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { 
  ValidationError, 
  UnauthorizedError 
} = require('../middleware/errorHandler');

// Ethereum Signature Authentication
router.post('/authenticate', async (req, res, next) => {
  try {
    console.log('Authentication Request Body:', req.body);

    const { message, signature, address } = req.body;

    // Validate input
    if (!message || !signature || !address) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Message, signature, and address are required'
        }
      });
    }

    // Verify signature
    let signerAddress;
    try {
      signerAddress = ethers.verifyMessage(message, signature);
      console.log('Verified Signer Address:', signerAddress);
    } catch (error) {
      console.error('Signature Verification Error:', error);
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid signature'
        }
      });
    }

    // Validate that the signer address matches the provided address
    if (signerAddress.toLowerCase() !== address.toLowerCase()) {
      console.warn('Address Mismatch', {
        signerAddress: signerAddress.toLowerCase(),
        providedAddress: address.toLowerCase()
      });
      return res.status(401).json({
        success: false,
        error: {
          message: 'Signature does not match the provided address'
        }
      });
    }

    // Find or create user
    let [user, created] = await User.findOrCreate({
      where: { ethereumAddress: signerAddress },
      defaults: {
        ethereumAddress: signerAddress,
        lastLogin: new Date()
      }
    });

    // Update last login
    if (!created) {
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        ethereumAddress: user.ethereumAddress 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRATION || '1h' 
      }
    );

    // Respond with success
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        ethereumAddress: user.ethereumAddress,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    // Log the full error
    console.error('Authentication Error:', error);

    // Handle unexpected errors
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

// Profile Route
router.get('/profile', async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No token provided'
        }
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired token'
        }
      });
    }

    // Find user
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'ethereumAddress', 'lastLogin']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        ethereumAddress: user.ethereumAddress,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile Fetch Error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

module.exports = router;