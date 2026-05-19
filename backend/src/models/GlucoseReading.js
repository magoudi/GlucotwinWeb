const mongoose = require('mongoose');

const glucoseReadingSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    value: {
      type: Number,
      required: true,
      min: [20, 'Glucose reading too low to be valid'],
      max: [600, 'Glucose reading too high to be valid'],
    },
    unit: {
      type: String,
      enum: ['mg/dL', 'mmol/L'],
      default: 'mg/dL',
    },
    source: {
      type: String,
      enum: ['cgm', 'manual', 'import', 'pump'],
      default: 'manual',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

glucoseReadingSchema.index({ patientId: 1, timestamp: -1 });

module.exports = mongoose.model('GlucoseReading', glucoseReadingSchema);
