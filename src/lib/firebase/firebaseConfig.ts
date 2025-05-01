// This configuration is public and can be exposed to the client
export const firebaseConfig = {
  apiKey: "AIzaSyD6GqvsWAFpUNbiMYiSJaGOmqUZC1R_x_U",
  authDomain: "stripe-coach.firebaseapp.com",
  projectId: "stripe-coach",
  storageBucket: "stripe-coach.firebasestorage.app",
  messagingSenderId: "94281208704",
  appId: "1:94281208704:web:9c4778d06c0961ce09196",
  measurementId: "G-WLPGHMJQ4K",
  databaseURL: "https://stripe-coach-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Validate the configuration
export const validateFirebaseConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missingFields = requiredFields.filter(
    field => !firebaseConfig[field]
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Firebase configuration fields: ${missingFields.join(', ')}`
    );
  }

  return true;
}; 