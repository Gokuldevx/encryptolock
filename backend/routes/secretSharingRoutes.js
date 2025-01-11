// routes/secretSharingRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const SecretSharingService = require('../services/secretSharingService');

// Share Secret
router.post('/share', authMiddleware, async (req, res) => {
  try {
    const { secretId, recipientAddress } = req.body;
    const sharedSecret = await SecretSharingService.shareSecret(
      req.user.id, 
      secretId, 
      recipientAddress
    );
    res.status(201).json(sharedSecret);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Accept Shared Secret
router.post('/accept', authMiddleware, async (req, res) => {
  try {
    const { shareId } = req.body;
    const acceptedSecret = await SecretSharingService.acceptSharedSecret(
      req.user.id, 
      shareId
    );
    res.json(acceptedSecret);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;