const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        'glucose_reading',
        'meal',
        'insulin',
        'activity',
        'prediction',
        'treatment_plan',
        'safety_warning',
        'profile_update',
        'connector_sync',
        'sleep',
        'plan',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    detail: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    impact: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    severity: {
      type: String,
      enum: ['info', 'safe', 'warning', 'danger'],
      default: 'info',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

timelineEventSchema.index({ patientId: 1, timestamp: -1 });

module.exports = mongoose.model('TimelineEvent', timelineEventSchema);
