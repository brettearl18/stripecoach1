const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing Firebase database...');

    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }

    const db = admin.firestore();
    const batch = db.batch();

    // Core Collections
    console.log('📁 Creating core collections...');
    
    // Users collection with default admin
    const usersRef = db.collection('users').doc('admin');
    batch.set(usersRef, {
      email: 'admin@example.com',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true
    });

    // Organizations collection
    const orgRef = db.collection('organizations').doc('default');
    batch.set(orgRef, {
      name: 'Default Organization',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        allowClientRegistration: true,
        requireCoachApproval: true
      }
    });

    // Check-in & Forms
    console.log('📝 Setting up check-in system...');
    
    // Check-in templates
    const templateRef = db.collection('checkInTemplates').doc('default');
    batch.set(templateRef, {
      name: 'Default Check-in',
      questions: [
        {
          type: 'text',
          question: 'How are you feeling today?',
          required: true
        },
        {
          type: 'number',
          question: 'Rate your energy level (1-10)',
          required: true,
          min: 1,
          max: 10
        }
      ],
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        openWindow: 48, // hours
        reminderEnabled: true
      }
    });

    // Program Management
    console.log('📚 Creating program management collections...');
    
    // Programs collection
    const programRef = db.collection('programs').doc('welcome');
    batch.set(programRef, {
      name: 'Welcome Program',
      description: 'Getting started with your coaching journey',
      type: 'onboarding',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Resources collection
    const resourceRef = db.collection('resources').doc('getting-started');
    batch.set(resourceRef, {
      title: 'Getting Started Guide',
      type: 'document',
      access: 'all',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Analytics & Reporting
    console.log('📊 Setting up analytics collections...');
    
    // Metrics collection
    const metricsRef = db.collection('metrics').doc('system');
    batch.set(metricsRef, {
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      totalUsers: 0,
      activeClients: 0,
      completedCheckIns: 0
    });

    // Execute batch write
    await batch.commit();
    console.log('✅ Database initialization completed successfully!');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}

// Run initialization
initializeDatabase().then(success => {
  if (!success) {
    process.exit(1);
  }
}); 