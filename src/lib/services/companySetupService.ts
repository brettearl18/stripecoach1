import { db, auth } from '../firebase/config';
import { collection, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

interface CompanySetup {
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subscription?: {
    plan: 'starter' | 'professional' | 'enterprise';
    billingCycle: 'monthly' | 'annual';
  };
}

interface CoachSetup {
  name: string;
  email: string;
  phone?: string;
  specialties?: string[];
  certifications?: string[];
  companyId: string;
}

export const companySetupService = {
  async createCompanyAdmin(
    companyData: CompanySetup,
    adminEmail: string,
    adminPassword: string
  ) {
    try {
      // 1. Create company document in Firestore
      const companyRef = doc(collection(db, 'companies'));
      const companyId = companyRef.id;

      const companyDoc = {
        id: companyId,
        name: companyData.name,
        status: 'active',
        createdAt: new Date(),
        subscription: companyData.subscription || {
          plan: 'starter',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          billingCycle: 'monthly',
        },
        settings: {
          maxCoaches: 5,
          maxClientsPerCoach: 50,
          features: ['basic'],
        },
        contact: {
          email: companyData.email,
          phone: companyData.phone || null,
          // Only include address if all required fields are provided
          ...(companyData.address && {
            address: {
              street: companyData.address.street || '',
              city: companyData.address.city || '',
              state: companyData.address.state || '',
              postalCode: companyData.address.postalCode || '',
              country: companyData.address.country || '',
            }
          })
        },
        metrics: {
          totalRevenue: 0,
          activeCoaches: 0,
          totalClients: 0,
          averageClientEngagement: 0,
        }
      };

      // 2. Create admin user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminEmail,
        adminPassword
      );

      // 3. Create admin profile in Firestore
      const adminDoc = {
        id: userCredential.user.uid,
        email: adminEmail,
        name: companyData.name + ' Admin',
        role: 'company_admin',
        companyId: companyId,
        createdAt: new Date(),
        status: 'active',
      };

      // 4. Batch write company and admin documents
      await Promise.all([
        setDoc(companyRef, companyDoc),
        setDoc(doc(db, 'users', userCredential.user.uid), adminDoc)
      ]);

      return {
        companyId,
        adminId: userCredential.user.uid,
      };
    } catch (error) {
      console.error('Error creating company admin:', error);
      throw error;
    }
  },

  async addCoach(coachData: CoachSetup, password: string) {
    try {
      // 1. Verify company exists
      const companyRef = doc(db, 'companies', coachData.companyId);
      const companyDoc = await getDoc(companyRef);
      
      if (!companyDoc.exists()) {
        throw new Error('Company not found');
      }

      // 2. Create coach user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        coachData.email,
        password
      );

      // 3. Create coach profile in Firestore
      const coachDoc = {
        id: userCredential.user.uid,
        companyId: coachData.companyId,
        personalInfo: {
          name: coachData.name,
          email: coachData.email,
          phone: coachData.phone,
          timezone: 'Australia/Sydney', // Default for Vana Health
        },
        professional: {
          specialties: coachData.specialties || [],
          certifications: coachData.certifications || [],
          experience: 0,
          bio: '',
        },
        metrics: {
          activeClients: 0,
          completionRate: 0,
          responseTime: 0,
          clientProgress: 0,
          satisfaction: 0,
        },
        status: 'active',
        createdAt: new Date(),
        role: 'coach',
      };

      // 4. Create coach document and update company metrics
      await Promise.all([
        setDoc(doc(db, 'coaches', userCredential.user.uid), coachDoc),
        updateDoc(companyRef, {
          'metrics.activeCoaches': companyDoc.data().metrics.activeCoaches + 1,
        })
      ]);

      return {
        coachId: userCredential.user.uid,
        companyId: coachData.companyId,
      };
    } catch (error) {
      console.error('Error adding coach:', error);
      throw error;
    }
  },

  // Example usage for Vana Health:
  async setupVanaHealth() {
    try {
      // 1. Set up Vana Health company and admin
      const companySetup = {
        name: 'Vana Health Pty Ltd',
        email: 'admin@vanahealth.com.au',
        phone: '+61000000000', // Replace with actual phone
        address: {
          street: '123 Health Street',
          city: 'Sydney',
          state: 'NSW',
          postalCode: '2000',
          country: 'Australia',
        },
        subscription: {
          plan: 'professional',
          billingCycle: 'annual',
        },
      };

      const { companyId } = await this.createCompanyAdmin(
        companySetup,
        'admin@vanahealth.com.au',
        'temporaryPassword123' // Should be changed on first login
      );

      // 2. Set up Silvana Earl as coach
      const coachSetup = {
        name: 'Silvana Earl',
        email: 'silvi@vanahealth.com.au',
        phone: '+61000000000', // Replace with actual phone
        specialties: ['Nutrition', 'Wellness Coaching', 'Health Management'],
        certifications: ['Certified Health Coach', 'Nutrition Specialist'],
        companyId: companyId,
      };

      await this.addCoach(coachSetup, 'temporaryPassword123'); // Should be changed on first login

      return {
        success: true,
        companyId,
        message: 'Vana Health Pty Ltd setup completed successfully',
      };
    } catch (error) {
      console.error('Error setting up Vana Health:', error);
      throw error;
    }
  }
}; 