// Simple script to test the update checker functionality
// Use ts-node to run TypeScript files
require('ts-node/register');

const { checkForUpdates } = require('../utils/version');

// Force an update check (this will bypass cooldown periods and other checks)
checkForUpdates(true, true).then(updateAvailable => {
  console.log('Update check result:', updateAvailable);
  if (updateAvailable) {
    console.log('✅ Update dialog should be shown');
  } else {
    console.log('❌ No update available or error occurred');
  }
});

console.log('Running update check test...');
