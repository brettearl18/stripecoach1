import { useState, useEffect } from 'react';
import { auth, db, storage, analytics } from '@/lib/firebase/config';
import { signInAnonymously, User } from 'firebase/auth';
import { collection, addDoc, getDocs, query, limit, deleteDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { logEvent } from 'firebase/analytics';

const FirebaseConnectionTest = () => {
  const [status, setStatus] = useState<{[key: string]: string}>({});
  const [error, setError] = useState<string | null>(null);

  const updateStatus = (key: string, value: string) => {
    setStatus(prev => ({ ...prev, [key]: value }));
  };

  const runTests = async () => {
    setError(null);
    setStatus({});

    try {
      // Test 1: Authentication
      updateStatus('auth', '🔄 Testing authentication...');
      const userCred = await signInAnonymously(auth);
      updateStatus('auth', '✅ Authentication successful');

      // Test 2: Firestore
      updateStatus('firestore', '🔄 Testing Firestore...');
      const testCollection = collection(db, 'connection_tests');
      
      // Write test
      const testDoc = await addDoc(testCollection, {
        timestamp: new Date(),
        test: true,
        userId: userCred.user.uid
      });
      
      // Read test
      const q = query(collection(db, 'connection_tests'), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        updateStatus('firestore', '✅ Firestore read/write successful');
      }

      // Cleanup
      await deleteDoc(testDoc);

      // Test 3: Analytics
      updateStatus('analytics', '🔄 Testing Analytics...');
      if (analytics && typeof window !== 'undefined') {
        logEvent(analytics, 'connection_test', {
          test_type: 'initial_connection',
          user_id: userCred.user.uid
        });
        updateStatus('analytics', '✅ Analytics event logged');
      } else {
        updateStatus('analytics', '⚠️ Analytics not available (normal in development)');
      }

      // Test 4: Storage (Optional)
      try {
        updateStatus('storage', '🔄 Testing Storage...');
        const storageRef = ref(storage, `test/${userCred.user.uid}/test.txt`);
        await uploadString(storageRef, 'Test content');
        const url = await getDownloadURL(storageRef);
        
        if (url) {
          updateStatus('storage', '✅ Storage upload/download successful');
          // Cleanup
          await deleteObject(storageRef);
        }
      } catch (storageErr) {
        updateStatus('storage', '⚠️ Storage not configured (setup required)');
        console.log('Storage test skipped:', storageErr.message);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Firebase connection test failed:', err);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Firebase Connection Test</h2>
      
      {Object.entries(status).map(([key, value]) => (
        <div key={key} className="flex items-center space-x-2 p-2 border-b">
          <span className="font-medium capitalize w-24">{key}:</span>
          <span className="flex-1">{value}</span>
        </div>
      ))}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={runTests}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Run Tests Again
        </button>
      </div>

      {status.storage === '⚠️ Storage not configured (setup required)' && (
        <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 rounded text-sm">
          <p className="font-medium">Storage Setup Required:</p>
          <ol className="list-decimal ml-4 mt-2 space-y-1">
            <li>Go to Firebase Console</li>
            <li>Select Storage from the left menu</li>
            <li>Click "Get Started"</li>
            <li>Follow the setup wizard</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default FirebaseConnectionTest; 