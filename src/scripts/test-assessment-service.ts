import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, Timestamp, Firestore } from 'firebase/firestore';
// import { db } from '../lib/services/assessmentService';
import {
  saveAssessment,
  getAssessment,
  hasCompletedAssessment,
  saveAssessmentProgress,
  getAssessmentProgress,
  deleteAssessmentProgress,
  getRecentAssessments,
  getIncompleteAssessments,
  type Assessment,
  type Profile,
  type AssessmentProgress
} from '../lib/services/assessmentService';
import { firebaseConfig } from '../../lib/firebase/config';

const app = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

// Test user ID
const TEST_USER_ID = 'test-user-' + Date.now();

// Sample test data
const testProfile: Profile = {
  name: 'Test User',
  email: 'test@example.com',
  age: 30,
  gender: 'male',
  height: 180,
  heightUnit: 'cm',
  goals: ['Weight Loss', 'Muscle Gain'],
  dietaryRestrictions: ['Vegetarian'],
  medicalConditions: ['None']
};

const testAssessment: Assessment = {
  physicalStats: {
    currentWeight: 80,
    weightUnit: 'kg',
    targetWeight: 75
  },
  lifestyle: {
    sleepQuality: 4,
    energyLevel: 3,
    stressLevel: 2,
    dietaryRestrictions: ['Vegetarian']
  },
  fitness: {
    currentLevel: 'intermediate',
    injuries: 'None',
    goals: ['Weight Loss', 'Muscle Gain']
  }
};

const testProgress: AssessmentProgress = {
  profile: testProfile,
  selectedGoals: ['Weight Loss'],
  answers: {
    question1: 'Answer 1',
    question2: 'Answer 2'
  },
  currentQuestionIndex: 2
};

// Helper function to clean up test data
const cleanup = async () => {
  try {
    const assessmentRef = doc(db, 'assessments', TEST_USER_ID);
    const progressRef = doc(db, 'assessment_progress', TEST_USER_ID);
    const userRef = doc(db, 'users', TEST_USER_ID);
    
    await Promise.all([
      deleteDoc(assessmentRef),
      deleteDoc(progressRef),
      deleteDoc(userRef)
    ]);
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Test functions
const runTests = async () => {
  console.log('🧪 Starting assessment service tests...\n');

  try {
    // Test 1: Save and get assessment
    console.log('Test 1: Save and get assessment');
    await saveAssessment(TEST_USER_ID, testAssessment);
    const savedAssessment = await getAssessment(TEST_USER_ID);
    console.log(savedAssessment ? '✅ Assessment saved and retrieved' : '❌ Failed to save/retrieve assessment');

    // Test 2: Check assessment completion
    console.log('\nTest 2: Check assessment completion');
    const hasCompleted = await hasCompletedAssessment(TEST_USER_ID);
    console.log(hasCompleted ? '✅ Assessment completion status correct' : '❌ Assessment completion status incorrect');

    // Test 3: Save and get progress
    console.log('\nTest 3: Save and get progress');
    await saveAssessmentProgress(TEST_USER_ID, testProgress);
    const savedProgress = await getAssessmentProgress(TEST_USER_ID);
    console.log(savedProgress ? '✅ Progress saved and retrieved' : '❌ Failed to save/retrieve progress');

    // Test 4: Get recent assessments
    console.log('\nTest 4: Get recent assessments');
    const recentAssessments = await getRecentAssessments(5);
    console.log(`✅ Retrieved ${recentAssessments.length} recent assessments`);

    // Test 5: Get incomplete assessments
    console.log('\nTest 5: Get incomplete assessments');
    const incompleteAssessments = await getIncompleteAssessments();
    console.log(`✅ Retrieved ${incompleteAssessments.length} incomplete assessments`);

    // Test 6: Delete progress
    console.log('\nTest 6: Delete progress');
    await deleteAssessmentProgress(TEST_USER_ID);
    const deletedProgress = await getAssessmentProgress(TEST_USER_ID);
    console.log(!deletedProgress ? '✅ Progress deleted successfully' : '❌ Failed to delete progress');

    // Test 7: Validation tests
    console.log('\nTest 7: Validation tests');
    const invalidAssessment = {
      ...testAssessment,
      physicalStats: {
        ...testAssessment.physicalStats,
        currentWeight: -1 // Invalid weight
      }
    };

    try {
      await saveAssessment(TEST_USER_ID, invalidAssessment as Assessment);
      console.log('❌ Invalid assessment was saved');
    } catch (error) {
      console.log('✅ Invalid assessment was rejected');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await cleanup();
  }
};

// Run tests
runTests().catch(console.error); 