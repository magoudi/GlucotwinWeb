const mongoose = require('mongoose');

const treatmentPlanSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['draft', 'signed_pending_patient', 'pending', 'accepted', 'dismissed', 'active', 'archived'],
      default: 'draft',
    },
    patientComment: {
      type: String,
      default: '',
    },
    patientRespondedAt: {
      type: Date,
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    dismissedAt: {
      type: Date,
      default: null,
    },
    appliedAt: {
      type: Date,
      default: null,
    },
    clinicianReply: {
      type: String,
      default: '',
    },
    clinicianRepliedAt: {
      type: Date,
      default: null,
    },
    doctorSignatureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ElectronicSignature',
      default: null,
    },
    signedAt: {
      type: Date,
      default: null,
    },
    signedBy: {
      type: String, // Stringified Doctor Name or ID at time of signing
      default: null,
    },
    requiresSignature: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('TreatmentPlan', treatmentPlanSchema);
