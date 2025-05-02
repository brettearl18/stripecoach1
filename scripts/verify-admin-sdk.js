const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

async function verifyAdminSDK() {
  try {
    console.log('🔍 Verifying Firebase Admin SDK configuration...');

    // Check required environment variables
    const requiredVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_STORAGE_BUCKET'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Initialize Firebase Admin
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }

    // Test Firestore access
    const db = admin.firestore();
    const testCollection = 'admin_sdk_test';
    const testDoc = 'verification';
    
    await db.collection(testCollection).doc(testDoc).set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      test: true
    });
    await db.collection(testCollection).doc(testDoc).delete();
    console.log('✅ Firestore access verified');

    // Test Auth access
    const auth = admin.auth();
    const testUser = await auth.createUser({
      email: `test-${Date.now()}@example.com`,
      password: 'testPassword123!'
    });
    await auth.deleteUser(testUser.uid);
    console.log('✅ Auth access verified');

    // Test Storage access
    const storage = admin.storage();
    const bucket = storage.bucket();
    const [exists] = await bucket.exists();
    console.log('✅ Storage access verified');

    console.log('\n✅ Firebase Admin SDK configuration is valid and working!');
    return true;
  } catch (error) {
    console.error('\n❌ Firebase Admin SDK verification failed:', error.message);
    console.log('\nPlease check:');
    console.log('1. Your .env.local file has all required variables');
    console.log('2. The private key is properly formatted');
    console.log('3. The service account has proper permissions');
    return false;
  }
}

// Run verification
verifyAdminSDK().then(success => {
  if (!success) {
    process.exit(1);
  }
}); 