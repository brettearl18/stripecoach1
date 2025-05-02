const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, connectFirestoreEmulator } = require('firebase/firestore');
const { getAuth, connectAuthEmulator, signInAnonymously } = require('firebase/auth');
const { firebaseConfig } = require('./firebaseConfig');

// Initialize admin SDK
admin.initializeApp({
  projectId: firebaseConfig.projectId,
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

async function initializeCollections() {
  try {
    console.log('Initializing Firebase collections...');

    // Create organizations collection
    const orgRef = db.collection('organizations').doc('default');
    await orgRef.set({
      name: 'Default Organization',
      ownerId: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Organizations collection initialized');

    // Create users collection with admin user
    const adminRef = db.collection('users').doc('admin');
    await adminRef.set({
      email: 'admin@example.com',
      role: 'admin',
      name: 'System Admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Users collection initialized');

    // Create check-in templates collection
    const templateRef = db.collection('checkInTemplates').doc('default');
    await templateRef.set({
      title: 'Default Check-in',
      description: 'Standard check-in template',
      questions: [
        {
          type: 'text',
          text: 'How are you feeling today?',
          required: true
        },
        {
          type: 'number',
          text: 'Rate your energy level (1-10)',
          required: true,
          min: 1,
          max: 10
        }
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Check-in templates collection initialized');

    // Create programs collection
    const programRef = db.collection('programs').doc('default');
    await programRef.set({
      title: 'Default Program',
      description: 'Standard coaching program',
      duration: 12, // weeks
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Programs collection initialized');

    // Create resources collection
    const resourceRef = db.collection('resources').doc('default');
    await resourceRef.set({
      title: 'Welcome Guide',
      type: 'document',
      url: 'https://example.com/welcome-guide.pdf',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Resources collection initialized');

    // Create metrics collection
    const metricsRef = db.collection('metrics').doc('default');
    await metricsRef.set({
      type: 'system',
      data: {
        activeUsers: {
          total: 0,
          coaches: 0,
          clients: 0,
          byOrganization: {}
        },
        checkIns: {
          total: 0,
          completed: 0,
          pending: 0,
          completionRate: 0,
          averageResponseTime: 0
        },
        engagement: {
          averageSessionDuration: 0,
          messagesPerUser: 0,
          resourceAccessCount: 0
        },
        performance: {
          averageClientProgress: 0,
          coachResponseRate: 0,
          programCompletionRate: 0
        }
      },
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Metrics collection initialized');

    // Create analytics collection
    const analyticsRef = db.collection('analytics').doc('default');
    await analyticsRef.set({
      type: 'system',
      data: {
        userMetrics: {
          dailyActiveUsers: [],
          newUserRegistrations: [],
          userRetention: [],
          userChurn: []
        },
        engagementMetrics: {
          checkInCompletion: [],
          messageActivity: [],
          resourceAccess: [],
          featureUsage: []
        },
        businessMetrics: {
          revenue: [],
          subscriptionGrowth: [],
          clientAcquisition: [],
          coachUtilization: []
        },
        performanceMetrics: {
          clientProgress: [],
          coachPerformance: [],
          programEffectiveness: [],
          satisfactionScores: []
        }
      },
      timeframes: {
        daily: [],
        weekly: [],
        monthly: [],
        quarterly: []
      },
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Analytics collection initialized');

    // Create security settings collection
    const securityRef = db.collection('securitySettings').doc('default');
    await securityRef.set({
      authentication: {
        passwordRequirements: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        },
        sessionTimeout: 30, // minutes
        maxLoginAttempts: 5
      },
      twoFactor: {
        required: false,
        method: 'authenticator',
        expiry: 24 // hours
      },
      dataEncryption: {
        messageEncryption: true,
        fileEncryption: true,
        keyRotation: true
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Security settings collection initialized');

    // Create billing collections
    const subscriptionRef = db.collection('subscriptions').doc('default');
    await subscriptionRef.set({
      name: 'Basic Plan',
      description: 'Standard coaching platform access',
      price: 99.99,
      billingCycle: 'monthly',
      features: ['Basic coaching tools', 'Up to 10 clients', 'Standard support'],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Subscriptions collection initialized');

    const paymentRef = db.collection('payments').doc('default');
    await paymentRef.set({
      status: 'pending',
      amount: 0,
      currency: 'USD',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Payments collection initialized');

    const invoiceRef = db.collection('invoices').doc('default');
    await invoiceRef.set({
      status: 'draft',
      amount: 0,
      currency: 'USD',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Invoices collection initialized');

    // Create communication collections
    const messageRef = db.collection('messages').doc('default');
    await messageRef.set({
      type: 'system',
      content: 'Welcome to the platform!',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Messages collection initialized');

    const notificationRef = db.collection('notifications').doc('default');
    await notificationRef.set({
      type: 'system',
      title: 'System Notification',
      message: 'Welcome to the platform!',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Notifications collection initialized');

    const communicationSettingsRef = db.collection('communicationSettings').doc('default');
    await communicationSettingsRef.set({
      emailNotifications: true,
      pushNotifications: true,
      checkInReminders: true,
      messageAlerts: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Communication settings collection initialized');

    // Create business collections
    const companyRef = db.collection('companies').doc('default');
    await companyRef.set({
      name: 'Default Company',
      status: 'active',
      settings: {
        maxCoaches: 10,
        maxClientsPerCoach: 20,
        features: ['Basic', 'Standard', 'Premium']
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Companies collection initialized');

    const planRef = db.collection('plans').doc('default');
    await planRef.set({
      name: 'Basic Plan',
      price: 99.99,
      features: ['Basic coaching tools', 'Up to 10 clients'],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Plans collection initialized');

    const certificationRef = db.collection('certifications').doc('default');
    await certificationRef.set({
      name: 'Default Certification',
      type: 'coach',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Certifications collection initialized');

    // Create reports collection
    const reportRef = db.collection('reports').doc('default');
    await reportRef.set({
      type: 'system',
      name: 'Default Report',
      category: 'performance',
      parameters: {
        timeframe: 'monthly',
        metrics: ['userActivity', 'engagement', 'performance'],
        filters: {}
      },
      data: {
        summary: {},
        details: {},
        charts: [],
        recommendations: []
      },
      status: 'draft',
      generatedBy: 'system',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Reports collection initialized');

    // Create audit logs collection
    const auditLogRef = db.collection('auditLogs').doc('default');
    await auditLogRef.set({
      type: 'system',
      action: 'initialization',
      category: 'system',
      details: {
        action: 'system_initialization',
        status: 'success',
        changes: [],
        affectedResources: []
      },
      user: {
        id: 'system',
        role: 'system',
        ip: '127.0.0.1'
      },
      metadata: {
        browser: 'system',
        platform: 'server',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Audit logs collection initialized');

    // Create performance metrics collection
    const performanceMetricsRef = db.collection('performanceMetrics').doc('default');
    await performanceMetricsRef.set({
      type: 'system',
      metrics: {
        userActivity: {
          activeUsers: 0,
          newRegistrations: 0,
          returningUsers: 0,
          sessionDuration: 0
        },
        engagement: {
          totalCheckIns: 0,
          completedCheckIns: 0,
          messagesSent: 0,
          resourcesAccessed: 0
        },
        business: {
          revenue: 0,
          subscriptions: 0,
          clientRetention: 0,
          coachUtilization: 0
        },
        performance: {
          clientProgress: 0,
          coachResponseRate: 0,
          programCompletion: 0,
          satisfactionScore: 0
        }
      },
      timeframes: {
        daily: {},
        weekly: {},
        monthly: {},
        quarterly: {}
      },
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Performance metrics collection initialized');

    // Create program templates collection
    const programTemplateRef = db.collection('programTemplates').doc('default');
    await programTemplateRef.set({
      title: 'Default Program Template',
      description: 'Standard program template',
      version: '1.0.0',
      structure: {
        modules: [],
        resources: [],
        assessments: []
      },
      metadata: {
        createdBy: 'system',
        lastModifiedBy: 'system',
        tags: ['default', 'template'],
        category: 'general'
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Program templates collection initialized');

    // Create resource library collection
    const resourceLibraryRef = db.collection('resourceLibrary').doc('default');
    await resourceLibraryRef.set({
      title: 'Default Resource Library',
      description: 'Standard resource library',
      categories: {
        documents: [],
        videos: [],
        worksheets: [],
        templates: []
      },
      access: {
        public: false,
        allowedRoles: ['admin', 'coach'],
        allowedOrganizations: []
      },
      metadata: {
        totalResources: 0,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Resource library collection initialized');

    // Create program versions collection
    const programVersionsRef = db.collection('programVersions').doc('default');
    await programVersionsRef.set({
      programId: 'default',
      version: '1.0.0',
      changes: {
        description: 'Initial version',
        modifiedBy: 'system',
        changes: []
      },
      content: {
        modules: [],
        resources: [],
        assessments: []
      },
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Program versions collection initialized');

    // Create assessments collection
    const assessmentsRef = db.collection('assessments').doc('default');
    await assessmentsRef.set({
      title: 'Initial Assessment',
      type: 'initial',
      questions: [
        {
          type: 'text',
          text: 'What are your main goals?',
          required: true
        },
        {
          type: 'multiple_choice',
          text: 'What is your current fitness level?',
          options: ['Beginner', 'Intermediate', 'Advanced'],
          required: true
        }
      ],
      metadata: {
        duration: 30, // minutes
        passingScore: 0,
        attemptsAllowed: 1
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Assessments collection initialized');

    // Create assessment responses collection
    const assessmentResponsesRef = db.collection('assessmentResponses').doc('default');
    await assessmentResponsesRef.set({
      assessmentId: 'default',
      userId: 'default',
      responses: [],
      score: 0,
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Assessment responses collection initialized');

    // Create calendar events collection
    const calendarEventsRef = db.collection('calendarEvents').doc('default');
    await calendarEventsRef.set({
      title: 'Default Event',
      type: 'check-in',
      startTime: admin.firestore.FieldValue.serverTimestamp(),
      endTime: admin.firestore.FieldValue.serverTimestamp(),
      participants: {
        coachId: 'default',
        clientId: 'default'
      },
      status: 'scheduled',
      metadata: {
        reminderSent: false,
        recurrence: null
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Calendar events collection initialized');

    // Create GDPR compliance collection
    const gdprComplianceRef = db.collection('gdprCompliance').doc('default');
    await gdprComplianceRef.set({
      settings: {
        dataRetention: {
          userData: 365, // days
          activityLogs: 90, // days
          assessmentData: 730 // days
        },
        consentManagement: {
          requiredConsents: [
            'data_collection',
            'marketing_emails',
            'data_sharing'
          ],
          consentHistory: []
        },
        dataExport: {
          lastExport: null,
          exportHistory: []
        },
        dataDeletion: {
          lastDeletion: null,
          deletionHistory: []
        }
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ GDPR compliance collection initialized');

    // Create custom reports collection
    const customReportsRef = db.collection('customReports').doc('default');
    await customReportsRef.set({
      name: 'Default Custom Report',
      type: 'performance',
      parameters: {
        metrics: ['userActivity', 'engagement', 'performance'],
        filters: {},
        timeframe: 'monthly'
      },
      schedule: {
        frequency: 'monthly',
        lastGenerated: null,
        nextGeneration: null
      },
      recipients: [],
      format: 'pdf',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Custom reports collection initialized');

    console.log('✅ All collections initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing collections:', error);
    return false;
  }
}

// Run the initialization
initializeCollections().then(success => {
  if (success) {
    console.log('✅ Database initialization completed successfully');
  } else {
    console.error('❌ Database initialization failed');
  }
}); 