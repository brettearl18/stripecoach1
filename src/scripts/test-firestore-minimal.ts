import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runMinimalTest() {
  const testDocRef = doc(db, 'test_collection', 'test_doc');
  const testData = { hello: 'world', timestamp: new Date().toISOString() };
  try {
    await setDoc(testDocRef, testData);
    console.log('✅ Minimal Firestore write succeeded:', testData);
  } catch (error) {
    console.error('❌ Minimal Firestore write failed:', error);
  }
}

runMinimalTest(); 