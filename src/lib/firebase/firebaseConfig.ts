// This configuration is public and can be exposed to the client
export const firebaseConfig = {
  apiKey: "AIzaSyBE1BCq88eQQ-fCl3sU4AMV3isWi2ywVtU",
  authDomain: "hubvana-checkin.firebaseapp.com",
  projectId: "hubvana-checkin",
  storageBucket: "hubvana-checkin.firebasestorage.app",
  messagingSenderId: "412607859652",
  appId: "1:412607859652:web:0d429ddd23972350d03291",
  measurementId: "G-FQRJ857NSV"
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