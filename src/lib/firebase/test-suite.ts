import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';
import { validateData, schemas } from './data-validation';
import { handleFirebaseError, ErrorType } from './error-handler';
import { validatePassword, checkAuthAttempts, incrementAuthAttempts } from './auth-rules';

async function runTests() {
  console.log('🔄 Starting Firebase Installation Tests...\n');

  try {
    // 1. Test Firebase Initialization
    console.log('1️⃣ Testing Firebase Initialization...');
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
    console.log('Config used:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });

    // 2. Test Firestore Connection
    console.log('\n2️⃣ Testing Firestore Connection...');
    const db = getFirestore(app);
    try {
      const testCollection = collection(db, 'users');
      const snapshot = await getDocs(testCollection);
      console.log(`✅ Firestore connected successfully. Found ${snapshot.size} documents in users collection`);
    } catch (error) {
      console.log('❌ Firestore test failed:', error);
      throw error;
    }

    // 3. Test Authentication
    console.log('\n3️⃣ Testing Authentication...');
    const auth = getAuth(app);
    try {
      const userCred = await signInAnonymously(auth);
      console.log('✅ Anonymous authentication successful');
      console.log('User ID:', userCred.user.uid);
      await signOut(auth);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.log('❌ Authentication test failed:', error);
      throw error;
    }

    // 4. Test Data Validation
    console.log('\n4️⃣ Testing Data Validation...');
    const testUser = {
      email: 'test@example.com',
      role: 'coach',
      name: 'Test User',
      phone: '+1234567890'
    };
    const validationResult = validateData(testUser, schemas.user);
    console.log('Data Validation Result:', validationResult.isValid ? '✅ Valid' : '❌ Invalid');
    if (!validationResult.isValid) {
      console.log('Validation Errors:', validationResult.errors);
    }

    // 5. Test Password Validation
    console.log('\n5️⃣ Testing Password Validation...');
    const testPassword = 'TestPass123!';
    const passwordValidation = validatePassword(testPassword);
    console.log('Password Validation Result:', passwordValidation.isValid ? '✅ Valid' : '❌ Invalid');
    if (!passwordValidation.isValid) {
      console.log('Password Validation Errors:', passwordValidation.errors);
    }

    // 6. Test Rate Limiting
    console.log('\n6️⃣ Testing Rate Limiting...');
    const testEmail = 'test@example.com';
    for (let i = 0; i < 6; i++) {
      incrementAuthAttempts(testEmail);
      const attemptCheck = checkAuthAttempts(testEmail);
      console.log(`Attempt ${i + 1}: ${attemptCheck.allowed ? '✅ Allowed' : '❌ Blocked'}`);
      if (!attemptCheck.allowed) {
        console.log(`Lockout time remaining: ${attemptCheck.timeLeft} minutes`);
      }
    }

    // 7. Test Error Handler
    console.log('\n7️⃣ Testing Error Handler...');
    const testError = new Error('Test error');
    const handledError = handleFirebaseError(testError, { test: true });
    console.log('Error Handler Result:', handledError.type === ErrorType.UNKNOWN ? '✅ Working' : '❌ Failed');

    console.log('\n✅ All installation tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    throw error;
  }
}

// Run the tests
runTests()
  .then(() => {
    console.log('\n🎉 Test suite completed!');
  })
  .catch((error) => {
    console.error('\n💥 Test suite failed with error:', error);
  }); 