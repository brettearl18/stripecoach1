const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, connectFirestoreEmulator } = require('firebase/firestore');
const { getAuth, connectAuthEmulator, signInAnonymously } = require('firebase/auth');
const { firebaseConfig } = require('./firebaseConfig');

async function testRules() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    // Connect to emulators
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');

    // Sign in anonymously
    console.log('Signing in anonymously...');
    const userCredential = await signInAnonymously(auth);
    const userId = userCredential.user.uid;
    console.log('Signed in as:', userId);

    // Test writing to users collection
    console.log('Testing users collection...');
    await setDoc(doc(db, 'users', userId), {
      email: 'test@example.com',
      role: 'admin'
    });
    console.log('✅ Users collection test passed');

    // Test writing to organizations collection
    console.log('Testing organizations collection...');
    const orgId = 'test-org-1';
    await setDoc(doc(db, 'organizations', orgId), {
      name: 'Test Organization',
      ownerId: userId
    });
    console.log('✅ Organizations collection test passed');

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testRules().then(success => {
  if (success) {
    console.log('✅ All tests passed');
  } else {
    console.error('❌ Tests failed');
  }
}); 