const { useInMemoryDb } = require('../config/env');
const SystemSettings = require('../models/SystemSettings');

let systemSettings = {
  maxBasalRate: 5.0,
  defaultTargetMin: 70,
  defaultTargetMax: 180,
  enableAdvancedWhatIf: false,
  maintenanceMode: false,
  dataExportEnabled: true,
  notificationsEnabled: true,
  betaFoodVision: false,
};

async function getSettings() {
  if (!useInMemoryDb) {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings(systemSettings);
      await settings.save();
    }
    return {
      maxBasalRate: settings.maxBasalRate,
      defaultTargetMin: settings.defaultTargetMin,
      defaultTargetMax: settings.defaultTargetMax,
      enableAdvancedWhatIf: settings.enableAdvancedWhatIf,
    };
  }
  return { ...systemSettings };
}

async function updateSettings(newSettings) {
  if (!useInMemoryDb) {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({ ...systemSettings, ...newSettings });
    } else {
      Object.assign(settings, newSettings);
    }
    await settings.save();
    return getSettings();
  }
  systemSettings = { ...systemSettings, ...newSettings };
  return getSettings();
}

module.exports = {
  getSettings,
  updateSettings,
};
