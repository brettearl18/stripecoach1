const fs = require('fs');
const path = require('path');

// Path to your downloaded service account JSON file
const serviceAccountPath = path.join(process.cwd(), 'stripe-coach-firebase-adminsdk-fbsvc-212fe97e98.json');

try {
  // Read the service account file
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  // Format the private key for .env file
  const formattedPrivateKey = serviceAccount.private_key
    .split('\n')
    .join('\\n');

  // Create the environment variables
  const envVars = [
    `FIREBASE_PROJECT_ID=${serviceAccount.project_id}`,
    `FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`,
    `FIREBASE_PRIVATE_KEY="${formattedPrivateKey}"`,
    `FIREBASE_STORAGE_BUCKET=${serviceAccount.project_id}.appspot.com`
  ].join('\n');

  // Read existing .env.local if it exists
  let envLocal = '';
  try {
    envLocal = fs.readFileSync('.env.local', 'utf8');
  } catch (error) {
    console.log('No existing .env.local file found, creating new one');
  }

  // Update or add Firebase Admin variables
  const updatedEnvLocal = envLocal
    .split('\n')
    .filter(line => !line.startsWith('FIREBASE_'))
    .concat(envVars)
    .join('\n');

  // Write to .env.local
  fs.writeFileSync('.env.local', updatedEnvLocal);

  console.log('✅ Successfully updated .env.local with Firebase Admin SDK configuration');
  console.log('Please verify the following values in your .env.local file:');
  console.log('- FIREBASE_PROJECT_ID');
  console.log('- FIREBASE_CLIENT_EMAIL');
  console.log('- FIREBASE_PRIVATE_KEY');
  console.log('- FIREBASE_STORAGE_BUCKET');

} catch (error) {
  console.error('❌ Error processing service account:', error.message);
  console.log('\nPlease ensure you have:');
  console.log('1. Downloaded the service account JSON file from Firebase Console');
  console.log('2. Placed it in your project root as "stripe-coach-firebase-adminsdk-fbsvc-212fe97e98.json"');
  console.log('3. Have proper read/write permissions');
} 