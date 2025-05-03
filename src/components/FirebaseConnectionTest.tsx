import React, { useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { toast } from 'react-hot-toast';

export default function FirebaseConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{[key: string]: boolean}>({});

  const testFirestore = async () => {
    try {
      const db = getFirestore();
      const testCollection = collection(db, 'test');
      await getDocs(testCollection);
      return true;
    } catch (error) {
      console.error('Firestore test failed:', error);
      return false;
    }
  };

  const testStorage = async () => {
    try {
      const storage = getStorage();
      const testRef = ref(storage, 'test/connection-test.txt');
      await uploadString(testRef, 'Connection test');
      await getDownloadURL(testRef);
      return true;
    } catch (error) {
      console.error('Storage test failed:', error);
      return false;
    }
  };

  const testAuth = async () => {
    try {
      const auth = getAuth();
      await signInAnonymously(auth);
      return true;
    } catch (error) {
      console.error('Auth test failed:', error);
      return false;
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults({});

    try {
      // Test Firestore
      const firestoreResult = await testFirestore();
      setResults(prev => ({ ...prev, firestore: firestoreResult }));
      
      // Test Storage
      const storageResult = await testStorage();
      setResults(prev => ({ ...prev, storage: storageResult }));
      
      // Test Auth
      const authResult = await testAuth();
      setResults(prev => ({ ...prev, auth: authResult }));

      // Show overall result
      const allPassed = firestoreResult && storageResult && authResult;
      toast.success(allPassed ? 'All Firebase connections successful!' : 'Some connections failed. Check the results.');
    } catch (error) {
      console.error('Test failed:', error);
      toast.error('Failed to complete all tests');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Firebase Connection Test</h2>
      
      <button
        onClick={runAllTests}
        disabled={testing}
        className={`px-4 py-2 rounded-lg ${
          testing
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {testing ? 'Testing...' : 'Test Firebase Connection'}
      </button>

      {Object.keys(results).length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="font-medium">Test Results:</h3>
          {Object.entries(results).map(([service, passed]) => (
            <div
              key={service}
              className={`flex items-center space-x-2 ${
                passed ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span className="capitalize">{service}:</span>
              <span>{passed ? '✅ Connected' : '❌ Failed'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 