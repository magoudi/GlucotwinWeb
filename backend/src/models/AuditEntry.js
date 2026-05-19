const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const auditEntrySchema = new mongoose.Schema(
  {
    actorId: {
      type: String,
      required: true,
      index: true,
    },
    actorRole: {
      type: String,
    },
    action: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
    },
    targetId: {
      type: String,
      index: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    previousHash: {
      type: String,
      required: true,
    },
    recordHash: {
      type: String,
      required: true,
      unique: true,
    },
    integrityVersion: {
      type: String,
      required: true,
      default: 'v1',
    },
    canonicalPayload: {
      type: String, // Stringified JSON
      required: true,
    },
  },
  { 
    timestamps: true,
    // Add strict options if needed
  }
);

// Prevent modifications and deletions to maintain audit integrity
const preventModification = function (next) {
  next(new AppError('Audit entries are append-only and cannot be modified or deleted', 403));
};

auditEntrySchema.pre('updateOne', preventModification);
auditEntrySchema.pre('updateMany', preventModification);
auditEntrySchema.pre('findOneAndUpdate', preventModification);
auditEntrySchema.pre('replaceOne', preventModification);
auditEntrySchema.pre('deleteOne', preventModification);
auditEntrySchema.pre('deleteMany', preventModification);
auditEntrySchema.pre('findOneAndDelete', preventModification);
auditEntrySchema.pre('findOneAndRemove', preventModification);

module.exports = mongoose.model('AuditEntry', auditEntrySchema);
