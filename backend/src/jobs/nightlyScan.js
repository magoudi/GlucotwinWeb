const cron = require('node-cron');
const userStore = require('../services/userStore');
const auditLog = require('../services/auditLog');

// Runs every minute for demonstration purposes. In production, use '0 2 * * *' (2 AM nightly)
function startNightlyScan() {
  cron.schedule('* * * * *', async () => {
    console.log('[CRON] Running automated AI safety scan on all patients...');
    
    try {
      const allUsers = await userStore.listAllUsers();
      const patients = allUsers.filter(u => u.role === 'patient');
      
      let alertsGenerated = 0;

      patients.forEach(patient => {
        // Mock risk detection logic
        if (patient.carbRatio < 8 || patient.correctionFactor < 20) {
          auditLog.log(
            'system', 
            'cron.alert.high_risk', 
            patient._id.toString(), 
            `[Automated Scan] High risk detected for ${patient.email}. Suggest reviewing carb ratio.`
          );
          alertsGenerated++;
        }
      });

      console.log(`[CRON] Scan complete. Generated ${alertsGenerated} automated alerts.`);
    } catch (error) {
      console.error('[CRON] Error during nightly scan:', error);
    }
  });
}

module.exports = {
  startNightlyScan
};
