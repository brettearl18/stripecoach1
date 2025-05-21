import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../../lib/firebase/config';

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