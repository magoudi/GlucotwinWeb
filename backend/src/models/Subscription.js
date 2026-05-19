const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['standard', 'premium', 'vip'],
      required: true,
    },
    packageId: {
      type: String,
      required: true,
    },
    billingPeriod: {
      type: String,
      enum: ['monthly', 'six_months', 'yearly'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'past_due', 'cancelled', 'expired'],
      default: 'pending',
    },
    currency: {
      type: String,
      default: 'egp',
    },
    amount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    stripeCheckoutSessionId: {
      type: String,
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    latestPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
