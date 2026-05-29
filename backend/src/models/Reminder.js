const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['insulin', 'glucose_check', 'meal', 'appointment', 'other'], required: true },
  title: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  repeatRule: { type: String }, // e.g. "daily", "weekly"
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
