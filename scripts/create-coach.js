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
    const email = await ask('Enter coach email: ');
    const password = await ask('Enter password: ');
    const name = await ask('Enter coach name: ');

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });
    console.log('✅ Coach user created:', userRecord.uid);

    // Create Firestore document in 'coaches' collection
    await db.collection('coaches').doc(userRecord.uid).set({
      email,
      name,
      role: 'coach',
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    });
    console.log('✅ Firestore coach document created.');
  } catch (err) {
    console.error('❌ Error creating coach:', err.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main(); 