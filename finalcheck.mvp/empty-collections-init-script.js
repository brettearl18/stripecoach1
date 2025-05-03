// Run this script with Node.js to initialize empty collections in Firestore for future features.
// Requires Firebase Admin SDK and service account credentials.

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // <-- Place your service account key here

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function init() {
  // 1. clientProgress (under a test client)
  await db.collection('clients').doc('testClient').collection('clientProgress').doc('init').set({ initialized: true });

  // 2. files (under a test user)
  await db.collection('users').doc('testUser').collection('files').doc('init').set({ initialized: true });
  //    uploads (under a test client)
  await db.collection('clients').doc('testClient').collection('uploads').doc('init').set({ initialized: true });

  // 3. userActivity (under a test user)
  await db.collection('users').doc('testUser').collection('userActivity').doc('init').set({ initialized: true });

  // 4. invites
  await db.collection('invites').doc('init').set({ initialized: true });

  // 5. archived
  await db.collection('archived').doc('init').set({ initialized: true });

  // 6. preferences (under a test user)
  await db.collection('users').doc('testUser').collection('preferences').doc('init').set({ initialized: true });

  // 7. supportTickets
  await db.collection('supportTickets').doc('init').set({ initialized: true });

  // 8. integrations
  await db.collection('integrations').doc('init').set({ initialized: true });

  // 9. webhooks
  await db.collection('webhooks').doc('init').set({ initialized: true });

  console.log('All empty collections initialized with a dummy document.');
  process.exit(0);
}

init().catch(err => {
  console.error('Error initializing collections:', err);
  process.exit(1);
}); 