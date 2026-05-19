const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      trim: true,
      default: 'general',
      maxlength: 100,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 0,
      max: 1440,
    },
    intensity: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      default: 'moderate',
    },
    calories: {
      type: Number,
      default: 0,
      min: 0,
      max: 10000,
    },
    steps: {
      type: Number,
      default: 0,
      min: 0,
      max: 200000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

activitySchema.index({ patientId: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);
