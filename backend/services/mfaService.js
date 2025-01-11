// services/mfaService.js
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class MFAService {
  // Generate MFA Secret
  static generateMFASecret(userId) {
    const secret = speakeasy.generateSecret({ 
      name: `EncryptoLock:${userId}` 
    });

    return {
      secret: secret.base32,
      otpAuthUrl: secret.otpauth_url
    };
  }

  // Generate QR Code for MFA
  static async generateQRCode(otpAuthUrl) {
    return QRCode.toDataURL(otpAuthUrl);
  }

  // Verify MFA Token
  static verifyMFAToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token
    });
  }
}

module.exports = MFAService;