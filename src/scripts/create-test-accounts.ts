import { adminAuth, adminDb, isFirebaseAdminInitialized } from '../lib/firebase-admin';
import { UserRecord } from 'firebase-admin/auth';

async function createTestAccounts() {
  try {
    // Check Firebase Admin initialization
    const status = isFirebaseAdminInitialized();
    console.log('Firebase Admin initialization status:', status);

    if (!adminAuth || !adminDb) {
      throw new Error('Firebase Admin services are not initialized. Check your environment variables and service account configuration.');
    }

    const auth = adminAuth;
    const db = adminDb;

    // Delete existing test accounts if they exist
    try {
      const existingUsers = await Promise.all([
        auth.getUserByEmail('admin@example.com').catch(() => null),
        auth.getUserByEmail('coach@example.com').catch(() => null),
        auth.getUserByEmail('client@example.com').catch(() => null),
      ]);

      await Promise.all(
        existingUsers
          .filter((user): user is UserRecord => user !== null)
          .map(async (user) => {
            console.log(`Deleting existing user: ${user.uid}`);
            await auth.deleteUser(user.uid);
            await db.collection('users').doc(user.uid).delete();
          })
      );
    } catch (error) {
      console.log('Error cleaning up existing users:', error);
    }

    // Create Admin account
    console.log('Creating admin account...');
    const adminUser = await auth.createUser({
      email: 'admin@example.com',
      password: 'password',
      displayName: 'Admin User'
    });

    await db.collection('users').doc(adminUser.uid).set({
      email: 'admin@example.com',
      displayName: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Create Coach account
    console.log('Creating coach account...');
    const coachUser = await auth.createUser({
      email: 'coach@example.com',
      password: 'password',
      displayName: 'Coach User'
    });

    await db.collection('users').doc(coachUser.uid).set({
      email: 'coach@example.com',
      displayName: 'Coach User',
      role: 'coach',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Create Client account
    console.log('Creating client account...');
    const clientUser = await auth.createUser({
      email: 'client@example.com',
      password: 'password',
      displayName: 'Client User'
    });

    await db.collection('users').doc(clientUser.uid).set({
      email: 'client@example.com',
      displayName: 'Client User',
      role: 'client',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Verify accounts were created
    console.log('\nVerifying accounts...');
    const verifyAdmin = await auth.getUserByEmail('admin@example.com');
    const verifyCoach = await auth.getUserByEmail('coach@example.com');
    const verifyClient = await auth.getUserByEmail('client@example.com');

    console.log('\nAccounts created successfully:');
    console.log('Admin:', verifyAdmin.email, '(uid:', verifyAdmin.uid, ')');
    console.log('Coach:', verifyCoach.email, '(uid:', verifyCoach.uid, ')');
    console.log('Client:', verifyClient.email, '(uid:', verifyClient.uid, ')');

  } catch (error) {
    console.error('Error creating test accounts:', error);
    process.exit(1);
  }
}

// Run the script
createTestAccounts(); 