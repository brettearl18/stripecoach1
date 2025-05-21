// test-checkin-flow.js

const admin = require('firebase-admin');
const path = require('path');

// Path to your service account key
const serviceAccount = require(path.join(__dirname, 'finalcheck.mvp', 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function runCheckinFlowTest() {
  // 1. Create a check-in template as a coach
  const templateId = 'test-template-' + Date.now();
  const templateRef = db.collection('checkInTemplates').doc(templateId);
  const templateData = {
    title: 'Test Check-in Template',
    description: 'A test template created by script',
    questions: [
      { type: 'text', text: 'How do you feel today?', required: true },
      { type: 'number', text: 'Energy level (1-10)?', required: true, min: 1, max: 10 }
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'coach-test',
  };
  await templateRef.set(templateData);
  console.log('✅ Check-in template created:', templateId);

  // 2. Submit a check-in response as a client
  const checkInId = 'test-checkin-' + Date.now();
  const checkInsRef = db.collection('checkIns').doc(checkInId);
  const checkInData = {
    templateId,
    clientId: 'client-test',
    coachId: 'coach-test',
    responses: [
      { question: 'How do you feel today?', answer: 'Great!' },
      { question: 'Energy level (1-10)?', answer: 8 }
    ],
    submittedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await checkInsRef.set(checkInData);
  console.log('✅ Check-in response submitted:', checkInId);

  // 3. Read both back and print results
  const savedTemplate = await templateRef.get();
  const savedCheckIn = await checkInsRef.get();
  console.log('\n--- Saved Template ---');
  console.log(savedTemplate.exists ? savedTemplate.data() : 'Not found');
  console.log('\n--- Saved Check-in ---');
  console.log(savedCheckIn.exists ? savedCheckIn.data() : 'Not found');

  process.exit(0);
}

runCheckinFlowTest().catch(err => {
  console.error('❌ Error in check-in flow test:', err);
  process.exit(1);
}); 