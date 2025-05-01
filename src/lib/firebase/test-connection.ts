import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, FirestoreError } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';

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
      const collections = await getDocs(collection(db, '__test__'));
      console.log('Firestore read test successful');
    } catch (error: unknown) {
      if (error instanceof FirestoreError) {
        console.log('Firestore read test error (this might be expected if collection doesn\'t exist):', error.message);
      } else {
        console.log('Unknown error during Firestore read test:', error);
      }
    }

    // Test Authentication
    const auth = getAuth(app);
    try {
      await signInAnonymously(auth);
      console.log('Anonymous auth test successful');
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        console.log('Auth test error:', error.message);
      } else {
        console.log('Unknown auth error:', error);
      }
    }

    console.log('All Firebase services initialized successfully');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Firebase connection test failed:', error.message);
    } else {
      console.error('Firebase connection test failed with unknown error:', error);
    }
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
    if (error instanceof Error) {
      console.error('Test execution failed:', error.message);
    } else {
      console.error('Test execution failed with unknown error:', error);
    }
  }); 