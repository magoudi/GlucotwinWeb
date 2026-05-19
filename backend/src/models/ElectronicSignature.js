const mongoose = require('mongoose');

const electronicSignatureSchema = new mongoose.Schema(
  {
    signerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    signerRole: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: ['TreatmentPlan'], // Add more target types if needed
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    meaning: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    recordSnapshotHash: {
      type: String,
      required: true,
    },
    signatureHash: {
      type: String,
      required: true,
    },
  },
  { 
    timestamps: true,
  }
);

module.exports = mongoose.model('ElectronicSignature', electronicSignatureSchema);
