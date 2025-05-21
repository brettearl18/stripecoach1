const admin = require('firebase-admin');
const readline = require('readline');
const path = require('path');

// Path to your service account key
const serviceAccount = require(path.join(__dirname, '../finalcheck.mvp/serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  try {
    const email = await ask('Enter client email: ');
    const password = await ask('Enter password: ');
    const name = await ask('Enter client name: ');
    const coachUid = await ask('Enter coach UID: ');

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });
    console.log('✅ Client user created:', userRecord.uid);

    // Create Firestore document in 'clients' collection
    await db.collection('clients').doc(userRecord.uid).set({
      email,
      name,
      role: 'client',
      coachId: coachUid,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    });
    console.log('✅ Firestore client document created.');

    // Create Firestore document in 'users' collection
    await db.collection('users').doc(userRecord.uid).set({
      email,
      name,
      role: 'client',
      coachId: coachUid,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    });
    console.log('✅ Firestore user document created.');
  } catch (err) {
    console.error('❌ Error creating client:', err.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main(); 