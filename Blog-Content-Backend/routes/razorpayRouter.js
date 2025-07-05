const express = require("express");

const isAuthenticated = require("../middlewares/isAuthenticated");

const {
  handleRazorpayPayment,
  handleFreeSubscription,
  verifyRazorpayPayment
} = require("../controllers/handleRazorpayPayment");

const razorpayRouter = express.Router();

razorpayRouter.post("/checkout", isAuthenticated, handleRazorpayPayment);
razorpayRouter.post("/free-plan", isAuthenticated, handleFreeSubscription);
razorpayRouter.post("/verify-payment/:paymentId", isAuthenticated, verifyRazorpayPayment);
module.exports = razorpayRouter;





