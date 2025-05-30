// Simple direct test for update checking
const fetch = require('node-fetch');

// Current app version from app.json
const APP_VERSION = '1.2.2';

// App Store ID for iOS
const APP_STORE_ID = '6737063241';
// Play Store package name for Android
const PACKAGE_NAME = 'com.aburuqayyah.salah';

// Test iOS version check
async function testIosVersionCheck() {
  try {
    const timestamp = new Date().getTime();
    const lookupUrl = `https://itunes.apple.com/lookup?id=${APP_STORE_ID}&country=us&t=${timestamp}`;
    
    console.log('\n📱 TESTING iOS VERSION CHECK');
    console.log('Fetching iOS version from iTunes API:', lookupUrl);
    
    const response = await fetch(lookupUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Timestamp': timestamp.toString()
      }
    });
    
    if (!response.ok) {
      throw new Error(`iTunes API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.results && data.results.length > 0) {
      const latestVersion = data.results[0].version;
      console.log('Successfully retrieved iOS version from iTunes API:', latestVersion);
      
      // Compare versions
      console.log(`Comparing versions - Latest: "${latestVersion}", Current: "${APP_VERSION}"`);
      const needsUpdate = compareVersions(latestVersion, APP_VERSION);
      console.log('Update needed (normal comparison):', needsUpdate ? '✅ YES' : '❌ NO');
      
      // Simulate full update check with force flag
      simulateFullUpdateCheck(latestVersion, APP_VERSION);
    } else {
      console.log('No results found in iTunes API response');
    }
  } catch (error) {
    console.error('Error fetching from iTunes API:', error);
  }
}

// Test Android version check
async function testAndroidVersionCheck() {
  try {
    const timestamp = new Date().getTime();
    // This URL is just for testing - in production we'd use the library
    const lookupUrl = `https://play.google.com/store/apps/details?id=${PACKAGE_NAME}&hl=en&gl=us`;
    
    console.log('\n🤖 TESTING ANDROID VERSION CHECK');
    console.log('Fetching Android version from Play Store (simulated):', lookupUrl);
    
    // Use the actual Play Store version
    const latestVersion = '1.1.6'; // Actual Play Store version
    
    console.log('Simulated Android version from Play Store:', latestVersion);
    
    // Compare versions
    console.log(`Comparing versions - Latest: "${latestVersion}", Current: "${APP_VERSION}"`);
    const needsUpdate = compareVersions(latestVersion, APP_VERSION);
    console.log('Update needed (normal comparison):', needsUpdate ? '✅ YES' : '❌ NO');
    
    // Simulate full update check with force flag
    simulateFullUpdateCheck(latestVersion, APP_VERSION);
  } catch (error) {
    console.error('Error in Android version check:', error);
  }
}

// Simple version comparison function
function compareVersions(latestVersion, currentVersion) {
  try {
    // Ensure versions are trimmed
    latestVersion = latestVersion.trim();
    currentVersion = currentVersion.trim();
    
    // Split version strings into components (e.g., "1.2.3" -> [1, 2, 3])
    const latest = latestVersion.split('.').map(Number);
    const current = currentVersion.split('.').map(Number);
    
    // Ensure both arrays have the same length by padding with zeros
    const maxLength = Math.max(latest.length, current.length);
    while (latest.length < maxLength) latest.push(0);
    while (current.length < maxLength) current.push(0);
    
    // Compare each component
    for (let i = 0; i < maxLength; i++) {
      if (latest[i] > current[i]) {
        console.log(`Update needed: component ${i+1} is newer (${latest[i]} > ${current[i]})`);
        return true;
      }
      if (latest[i] < current[i]) {
        console.log(`No update needed: component ${i+1} is older (${latest[i]} < ${current[i]})`);
        return false;
      }
    }
    
    // If we get here, versions are exactly equal
    console.log('Versions are identical');
    return false;
  } catch (error) {
    console.error('Error comparing versions:', error);
    return false;
  }
}

// Function to simulate the standard version check
function simulateFullUpdateCheck(latestVersion, currentVersion) {
  // Standard version comparison
  const updateNeeded = compareVersions(latestVersion, currentVersion);
  
  console.log('\nFINAL UPDATE DECISION:');
  console.log(`Version comparison result: ${updateNeeded ? '✅ Update needed' : '❌ No update needed'}`);
  console.log(`Will update dialog appear: ${updateNeeded ? '✅ YES' : '❌ NO'}`);
  
  return updateNeeded;
}

// Run the tests
console.log('🔍 RUNNING VERSION CHECK TESTS...');

// Run both tests sequentially
async function runTests() {
  await testIosVersionCheck();
  await testAndroidVersionCheck();
  console.log('\n✅ Tests completed!');
}

runTests();
