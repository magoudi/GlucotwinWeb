const mongoose = require('mongoose');
const connectDB = require('../config/db');
const auditLog = require('../services/auditLog');

async function main() {
  console.log('Connecting to database...');
  await connectDB();
  
  console.log('Verifying tamper-evident audit chain...');
  const result = await auditLog.verifyAuditChain();
  
  if (result.valid) {
    console.log(`✅ Audit chain is VALID.`);
    console.log(`✅ Checked ${result.checkedEntries} entries.`);
  } else {
    console.log(`❌ Audit chain is BROKEN!`);
    console.log(`❌ Failed at entry ID: ${result.brokenAt}`);
    console.log(`❌ Successfully checked ${result.checkedEntries} preceding entries.`);
    process.exit(1);
  }
  
  process.exit(0);
}

main().catch(err => {
  console.error('Failed to run verification:', err);
  process.exit(1);
});
