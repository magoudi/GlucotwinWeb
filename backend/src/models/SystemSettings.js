const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    version: {
      type: Number,
      default: 1,
    },
    maxBasalRate: {
      type: Number,
      default: 5.0,
    },
    defaultTargetMin: {
      type: Number,
      default: 70,
    },
    defaultTargetMax: {
      type: Number,
      default: 180,
    },
    enableAdvancedWhatIf: {
      type: Boolean,
      default: false,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    dataExportEnabled: {
      type: Boolean,
      default: true,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    betaFoodVision: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
