const mongoose = require('mongoose');

const doctorPatientRequestSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Message is too long'],
    },
    responseMessage: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Response message is too long'],
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Prevent duplicate pending requests from same patient to same doctor
doctorPatientRequestSchema.index({ patientId: 1, doctorId: 1, status: 1 });

module.exports = mongoose.model('DoctorPatientRequest', doctorPatientRequestSchema);
