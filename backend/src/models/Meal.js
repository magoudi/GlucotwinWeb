const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    foodName: {
      type: String,
      trim: true,
      default: '',
      maxlength: 200,
    },
    carbs: {
      type: Number,
      required: true,
      min: 0,
      max: 500,
    },
    protein: {
      type: Number,
      default: 0,
      min: 0,
      max: 500,
    },
    fat: {
      type: Number,
      default: 0,
      min: 0,
      max: 500,
    },
    fiber: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    portion: {
      type: String,
      trim: true,
      default: '',
      maxlength: 100,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'other'],
      default: 'other',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

mealSchema.index({ patientId: 1, timestamp: -1 });

module.exports = mongoose.model('Meal', mealSchema);
