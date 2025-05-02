const { initializeApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, signInAnonymously } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator, collection, addDoc } = require('firebase/firestore');
const { firebaseConfig } = require('./firebaseConfig');

async function testFirestore() {
  try {
    console.log('Testing Firestore data saving...');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'http://localhost:9099');

    // Initialize Firestore
    const db = getFirestore(app);
    connectFirestoreEmulator(db, 'localhost', 8080);

    // Sign in anonymously
    const userCredential = await signInAnonymously(auth);
    const userId = userCredential.user.uid;
    console.log('✅ Signed in as:', userId);

    // Test data
    const testData = {
      userId,
      type: 'test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'Hello Firestore!',
        number: 42
      }
    };

    // Save to Firestore
    console.log('Saving test data...');
    const docRef = await addDoc(collection(db, 'test-collection'), testData);
    console.log('✅ Data saved successfully with ID:', docRef.id);

    return true;
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    return false;
  }
}

// Run the test
testFirestore().then(success => {
  if (success) {
    console.log('✅ All Firestore tests passed');
  } else {
    console.error('❌ Firestore tests failed');
  }
}); 