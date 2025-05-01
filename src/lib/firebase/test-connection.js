import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { firebaseConfig } from './firebaseConfig.js';

async function testFirebaseConnection() {
  try {
    console.log('Initializing Firebase with config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      databaseURL: firebaseConfig.databaseURL
    });

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');

    // Test Firestore
    const db = getFirestore(app);
    console.log('Firestore initialized');

    // Try to list collections
    try {
      const collections = await getDocs(collection(db, 'users'));
      console.log('Firestore read test successful, found', collections.size, 'documents');
    } catch (error) {
      console.log('Firestore read test error:', error.message || error);
    }

    // Test Authentication
    const auth = getAuth(app);
    try {
      await signInAnonymously(auth);
      console.log('Anonymous auth test successful');
    } catch (error) {
      console.log('Auth test error:', error.message || error);
    }

    console.log('All Firebase services initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error.message || error);
    return false;
  }
}

// Run the test
testFirebaseConnection()
  .then(success => {
    if (success) {
      console.log('✅ Firebase connection test completed successfully');
    } else {
      console.log('❌ Firebase connection test failed');
    }
  })
  .catch(error => {
    console.error('Test execution failed:', error.message || error);
  }); 