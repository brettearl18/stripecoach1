import { initializeFirebaseAdmin } from '../src/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
initializeFirebaseAdmin();
const db = getFirestore();

// Mock check-in data with progression
const mockCheckIns = [
  {
    clientId: "mock_client_1", // Replace with actual client ID
    coachId: "mock_coach_1",   // Replace with actual coach ID
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    type: "Bi-weekly Check-in",
    status: "completed",
    responses: {
      "How many training sessions did you complete this week?": "4 out of 5 planned sessions",
      "Rate your overall energy levels (1-10)": "6",
      "How is your sleep quality (1-10)?": "7",
      "Are you experiencing any pain or discomfort?": "Slight knee pain during squats",
      "What's your current body weight?": "82kg",
      "How many steps are you averaging daily?": "7,500",
      "Rate your stress levels (1-10)": "7",
      "Are you following the nutrition plan?": "Following about 80% of the time",
      "What challenges did you face this week?": "Work schedule made it hard to fit in all sessions",
      "What wins would you like to celebrate?": "Hit a new PR on bench press"
    },
    metrics: {
      bodyweight: {
        current: 82,
        previous: 83,
        change: -1,
        trend: "down"
      },
      energyLevel: {
        current: 6,
        previous: 5,
        change: 1,
        trend: "up"
      },
      sleepQuality: {
        current: 7,
        previous: 6,
        change: 1,
        trend: "up"
      }
    }
  },
  {
    clientId: "mock_client_1",
    coachId: "mock_coach_1",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    type: "Bi-weekly Check-in",
    status: "completed",
    responses: {
      "How many training sessions did you complete this week?": "5 out of 5 planned sessions",
      "Rate your overall energy levels (1-10)": "7",
      "How is your sleep quality (1-10)?": "8",
      "Are you experiencing any pain or discomfort?": "Knee pain has improved with modified squat form",
      "What's your current body weight?": "81.2kg",
      "How many steps are you averaging daily?": "8,200",
      "Rate your stress levels (1-10)": "6",
      "Are you following the nutrition plan?": "90% adherence this week",
      "What challenges did you face this week?": "None major, felt more consistent",
      "What wins would you like to celebrate?": "Hit all planned sessions and improved nutrition adherence"
    },
    metrics: {
      bodyweight: {
        current: 81.2,
        previous: 82,
        change: -0.8,
        trend: "down"
      },
      energyLevel: {
        current: 7,
        previous: 6,
        change: 1,
        trend: "up"
      },
      sleepQuality: {
        current: 8,
        previous: 7,
        change: 1,
        trend: "up"
      }
    }
  },
  {
    clientId: "mock_client_1",
    coachId: "mock_coach_1",
    createdAt: new Date(), // Today
    type: "Bi-weekly Check-in",
    status: "pending",
    responses: {
      "How many training sessions did you complete this week?": "5 out of 5 planned sessions",
      "Rate your overall energy levels (1-10)": "8",
      "How is your sleep quality (1-10)?": "8",
      "Are you experiencing any pain or discomfort?": "No pain this week",
      "What's your current body weight?": "80.5kg",
      "How many steps are you averaging daily?": "9,000",
      "Rate your stress levels (1-10)": "5",
      "Are you following the nutrition plan?": "95% adherence, really getting into a groove",
      "What challenges did you face this week?": "Had a work dinner but managed to stay on track",
      "What wins would you like to celebrate?": "Down 2.5kg total and feeling stronger"
    },
    metrics: {
      bodyweight: {
        current: 80.5,
        previous: 81.2,
        change: -0.7,
        trend: "down"
      },
      energyLevel: {
        current: 8,
        previous: 7,
        change: 1,
        trend: "up"
      },
      sleepQuality: {
        current: 8,
        previous: 8,
        change: 0,
        trend: "stable"
      }
    }
  }
];

async function seedMockCheckIns() {
  try {
    // Create a batch write
    const batch = db.batch();

    // Add each check-in to the batch
    for (const checkIn of mockCheckIns) {
      const docRef = db.collection('check-ins').doc();
      batch.set(docRef, checkIn);
    }

    // Commit the batch
    await batch.commit();
    console.log('Successfully seeded mock check-ins');
  } catch (error) {
    console.error('Error seeding mock check-ins:', error);
  }
}

// Run the seeding
seedMockCheckIns().then(() => process.exit(0)); 