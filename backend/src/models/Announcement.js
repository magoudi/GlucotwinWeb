const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    audience: {
      type: String, // e.g. 'all', 'patient', 'doctor'
      required: true,
      default: 'all',
    },
    severity: {
      type: String, // 'info', 'warning', 'critical'
      required: true,
      default: 'info',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    startAt: {
      type: Date,
      default: Date.now,
    },
    endAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Announcement', announcementSchema);
