'use client';

import { useState, useEffect } from 'react';
import { auth, db, storage, analytics } from '@/lib/firebase/config';
import {
  signInAnonymously,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  query,
  limit,
  deleteDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { logEvent } from 'firebase/analytics';

interface TestStatus {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

export default function FirebaseTestPage() {
  const [tests, setTests] = useState<TestStatus[]>([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if Firebase services are initialized
    if (!auth || !db || !storage) {
      setTests([
        {
          name: 'Firebase Initialization',
          status: 'error',
          message: 'Firebase services are not properly initialized'
        }
      ]);
      return;
    }
  }, []);

  const updateTest = (name: string, status: TestStatus['status'], message?: string) => {
    setTests(prev => {
      const existing = prev.findIndex(t => t.name === name);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = { name, status, message };
        return updated;
      }
      return [...prev, { name, status, message }];
    });
  };

  const runAuthTests = async () => {
    if (!auth) {
      updateTest('Auth Tests', 'error', 'Auth service not initialized');
      return;
    }

    try {
      // Test 1: Anonymous Auth
      updateTest('Anonymous Auth', 'running');
      const anonResult = await signInAnonymously(auth);
      if (anonResult.user) {
        updateTest('Anonymous Auth', 'success');
        setUser(anonResult.user);
      }

      // Test 2: Email Auth
      updateTest('Email Auth', 'running');
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'Test123!';
      
      // Create user
      await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      // Sign out
      await signOut(auth);
      // Sign in
      const emailResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      if (emailResult.user) {
        updateTest('Email Auth', 'success');
        setUser(emailResult.user);
      }
    } catch (error: any) {
      console.error('Auth Test Error:', error);
      updateTest('Auth Tests', 'error', error.message);
    }
  };

  const runFirestoreTests = async () => {
    if (!db) {
      updateTest('Firestore', 'error', 'Firestore service not initialized');
      return;
    }

    try {
      updateTest('Firestore', 'running');
      
      // Test Collection
      const testCollection = collection(db, 'test_collection');
      
      // Write Test
      const testDoc = await addDoc(testCollection, {
        timestamp: new Date(),
        test: true
      });

      // Read Test
      const q = query(collection(db, 'test_collection'), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('No documents found');
      }

      // Cleanup
      await deleteDoc(testDoc);
      updateTest('Firestore', 'success');
    } catch (error: any) {
      console.error('Firestore Test Error:', error);
      updateTest('Firestore', 'error', error.message);
    }
  };

  const runStorageTests = async () => {
    if (!storage || !auth?.currentUser) {
      updateTest('Storage', 'error', 'Storage service not initialized or user not authenticated');
      return;
    }

    try {
      updateTest('Storage', 'running');
      
      // Create test content
      const testContent = 'Hello, Storage!';
      const timestamp = Date.now();
      const fileName = `test-files/${auth.currentUser.uid}/${timestamp}.txt`;
      
      // Upload
      const storageRef = ref(storage, fileName);
      await uploadString(storageRef, testContent, 'raw');
      
      // Download
      const url = await getDownloadURL(storageRef);
      if (!url) throw new Error('Failed to get download URL');
      
      // List files
      const testRef = ref(storage, `test-files/${auth.currentUser.uid}`);
      const files = await listAll(testRef);
      
      // Cleanup
      await Promise.all(files.items.map(fileRef => deleteObject(fileRef)));
      updateTest('Storage', 'success');
    } catch (error: any) {
      console.error('Storage Test Error:', error);
      const errorMessage = error.message || 'Unknown storage error';
      updateTest('Storage', 'error', `Storage error: ${errorMessage}`);
    }
  };

  const runAnalyticsTest = async () => {
    try {
      updateTest('Analytics', 'running');
      
      if (analytics) {
        logEvent(analytics, 'test_event', {
          test_id: Date.now(),
          user_id: auth?.currentUser?.uid
        });
        updateTest('Analytics', 'success');
      } else {
        updateTest('Analytics', 'success', 'Analytics not available in development');
      }
    } catch (error: any) {
      console.error('Analytics Test Error:', error);
      updateTest('Analytics', 'error', error.message);
    }
  };

  const runAllTests = async () => {
    setTests([]);
    
    // First check if auth is initialized
    if (!auth) {
      updateTest('Auth Tests', 'error', 'Auth service not initialized');
      return;
    }

    // Run auth tests first
    await runAuthTests();
    
    // Then check if we have a user after auth tests
    if (!auth?.currentUser) {
      updateTest('Storage', 'error', 'Authentication required before running storage tests');
      return;
    }

    await runFirestoreTests();
    await runStorageTests();
    await runAnalyticsTest();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Firebase Integration Tests
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Test all Firebase services and connections
          </p>
        </div>

        <div className="mt-10">
          <button
            onClick={runAllTests}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Run All Tests
          </button>

          <div className="mt-6 bg-white shadow overflow-hidden rounded-md">
            <ul className="divide-y divide-gray-200">
              {tests.map((test, index) => (
                <li key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{test.name}</span>
                    </div>
                    <div className="flex items-center">
                      {test.status === 'pending' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Pending
                        </span>
                      )}
                      {test.status === 'running' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Running
                        </span>
                      )}
                      {test.status === 'success' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Success
                        </span>
                      )}
                      {test.status === 'error' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Error
                        </span>
                      )}
                    </div>
                  </div>
                  {test.message && (
                    <p className="mt-2 text-sm text-gray-500">{test.message}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}