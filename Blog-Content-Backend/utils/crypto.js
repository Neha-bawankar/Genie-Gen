

const crypto = require("crypto");

/**
 * Generates an HMAC signature using SHA256
 * @param {string} orderId - The order ID from Razorpay
 * @param {string} paymentId - The payment ID from Razorpay
 * @param {string} secret - Your Razorpay secret key
 * @returns {string} - The generated signature
 */


/**
 * Verifies if the provi
 * ded signature matches the generated one
 * @param {string} orderId - The order ID
 * @param {string} paymentId - The payment ID
 * @param {string} signature - The signature received from Razorpay
 * @param {string} secret - Your Razorpay secret key
 * @returns {boolean} - Returns true if valid, false otherwise
 */

const verifyHmacSignature = (orderId, paymentId, signature) => {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET )
      .update(orderId + "|" + paymentId)
      .digest("hex");
  
    return generatedSignature === signature;
  };
  
  module.exports = { verifyHmacSignature };