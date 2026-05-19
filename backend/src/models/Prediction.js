const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    predictionType: {
      type: String,
      enum: ['bolus', 'basal', 'food', 'what_if'],
      required: true,
    },
    inputData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    resultData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    confidence: {
      type: Number,
      default: 0.86,
      min: 0,
      max: 1,
    },
    safetyStatus: {
      type: String,
      enum: ['safe', 'caution', 'unsafe'],
      default: 'safe',
    },
    drivers: {
      type: [
        {
          label: { type: String, required: true },
          detail: { type: String, default: '' },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

predictionSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('Prediction', predictionSchema);
