const { initializeApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, signInAnonymously } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');
const { firebaseConfig } = require('./firebaseConfig');

async function testConfig() {
  try {
    console.log('Testing Firebase configuration...');
    console.log('Config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');

    // Initialize Auth
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('✅ Auth initialized and connected to emulator');

    // Initialize Firestore
    const db = getFirestore(app);
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ Firestore initialized and connected to emulator');

    // Test anonymous auth
    console.log('Testing anonymous authentication...');
    const userCredential = await signInAnonymously(auth);
    console.log('✅ Anonymous auth successful:', userCredential.user.uid);

    return true;
  } catch (error) {
    console.error('❌ Configuration test failed:', error);
    return false;
  }
}

// Run the test
testConfig().then(success => {
  if (success) {
    console.log('✅ All configuration tests passed');
  } else {
    console.error('❌ Configuration tests failed');
  }
}); 