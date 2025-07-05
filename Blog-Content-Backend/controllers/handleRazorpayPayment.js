const Razorpay = require("razorpay");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const Payment = require("../models/Payment");
const User = require("../models/User");
const { calculateNextBillingDate } = require("../utils/calculateNextBillingDate");
const { shouldRenewSubcriptionPlan } = require("../utils/shouldRenewsubcriptionPlan");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET // This is your secret API key,
});

//--- Create Razorpay Payment Order ---
const handleRazorpayPayment = asyncHandler(async (req, res) => {
  const { amount, subscriptionPlan } = req.body;
  const user = req?.user;

  try {
    const options = {
      amount: Number(amount) * 100, // paise
      currency: "INR",
      receipt: `rcptid-${Math.floor(Math.random() * 1000000)}`,
      notes: {
        userId: user._id.toString(),
        userEmail: user.email,
        subscriptionPlan,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      notes: order.notes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

//--- Verify Razorpay Payment ---
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    subscriptionPlan,
  } = req.body;

  const user = req?.user;

  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ error: "Invalid payment signature" });
  }

  try {
    const newPayment = await Payment.create({
      user: user._id,
      email: user.email,
      subscriptionPlan,
      amount: amount / 100,
      currency: "INR",
      status: "success",
      reference: razorpay_payment_id,
    });

    const updateData = {
      subscriptionPlan,
      trialPeriod: 0,
      nextBillingDate: calculateNextBillingDate(),
      apiRequestCount: 0,
      $addToSet: { payments: newPayment._id },
    };

    updateData.monthlyRequestCount = subscriptionPlan === "Basic" ? 50 : 100;

    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, {
      new: true,
    });

    res.json({
      status: true,
      message: "Payment verified, user updated",
      updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

//--- Handle Free Subscription ---
const handleFreeSubscription = asyncHandler(async (req, res) => {
  const user = req?.user;

  try {
    if (shouldRenewSubcriptionPlan(user)) {
      user.subscriptionPlan = "Free";
      user.monthlyRequestCount = 5;
      user.apiRequestCount = 0;
      user.nextBillingDate = calculateNextBillingDate();

      const newPayment = await Payment.create({
        user: user._id,
        subscriptionPlan: "Free",
        amount: 0,
        status: "success",
        reference: Math.random().toString(36).substring(7),
        currency: "INR",
      });

      user.payments.push(newPayment._id);
      await user.save();

      res.json({
        status: "success",
        message: "Subscription plan updated successfully",
        user,
      });
    } else {
      res.status(403).json({ error: "Subscription renewal not due yet" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

module.exports = {
  handleRazorpayPayment,
  verifyRazorpayPayment,
  handleFreeSubscription,
};

