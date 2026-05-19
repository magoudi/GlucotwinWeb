const mongoose = require('mongoose');

const insulinDoseSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dose: {
      type: Number,
      required: true,
      min: [0, 'Dose cannot be negative'],
      max: [100, 'Dose exceeds safe maximum for this prototype'],
    },
    insulinType: {
      type: String,
      enum: ['rapid', 'long', 'mixed', 'unknown'],
      default: 'rapid',
    },
    bolusType: {
      type: String,
      enum: ['meal', 'correction', 'manual', 'basal', 'unknown'],
      default: 'unknown',
    },
    source: {
      type: String,
      enum: ['pump', 'manual', 'import', 'prediction'],
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

insulinDoseSchema.index({ patientId: 1, timestamp: -1 });

module.exports = mongoose.model('InsulinDose', insulinDoseSchema);
