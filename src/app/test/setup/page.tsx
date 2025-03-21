'use client';

import { useState } from 'react';
import { 
  createTestCoach, 
  createTestClient, 
  createTestCheckInForm,
  createTestFormSubmission,
  type Coach,
  type Client,
  type CheckInForm,
  type FormSubmission,
  type ClientAnalytics,
  type AICoachingSuggestion,
  saveFormSubmission,
  updateClientAnalytics,
  generateAndSaveAISuggestions
} from '@/lib/services/firebaseService';

export default function TestSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [createdData, setCreatedData] = useState<{
    coach?: Coach;
    client?: Client;
    form?: CheckInForm;
    submission?: FormSubmission;
    analytics?: ClientAnalytics;
    suggestions?: AICoachingSuggestion;
  }>({});

  const handleCreateTestData = async () => {
    try {
      setIsLoading(true);
      
      // Create test coach
      const coach = await createTestCoach({
        name: "John Smith",
        email: "john@example.com",
        specialties: ["Nutrition", "Strength Training"],
        experience: "10+ years"
      });

      // Create test client
      const client = await createTestClient({
        name: "Sarah Johnson",
        email: "sarah@example.com",
        coachId: coach.id,
        goals: ["Weight Loss", "Muscle Gain"],
        preferences: {
          focusAreas: ["Nutrition", "Workout Plans"],
          communicationFrequency: "weekly"
        }
      });

      // Create test check-in form
      const form = await createTestCheckInForm({
        title: "Weekly Progress Check-in",
        description: "Track your weekly progress and habits",
        questions: [
          {
            id: 1,
            text: "How would you rate your energy levels this week?",
            type: "scale",
            required: true,
            options: {
              min: 1,
              max: 10,
              labels: {
                min: "Very Low",
                max: "Very High"
              }
            }
          },
          {
            id: 2,
            text: "What challenges did you face with your nutrition this week?",
            type: "text",
            required: true
          },
          {
            id: 3,
            text: "How many workouts did you complete this week?",
            type: "multiple_choice",
            required: true,
            options: ["0-1", "2-3", "4-5", "6+"]
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create test submission with analytics and AI suggestions
      const submission = await createTestFormSubmission({
        formId: form.id!,
        clientId: client.id,
        submittedAt: new Date(),
        answers: {
          1: 8,
          2: "I struggled with late-night snacking on Tuesday and Thursday, but otherwise stayed on track with meal prep.",
          3: "4-5"
        },
        metrics: {
          completionTime: 300, // 5 minutes in seconds
          questionsAnswered: 3,
          requiredQuestionsAnswered: 3
        },
        analytics: {
          consistencyScore: 85,
          trends: {
            energy: [7, 8, 8, 7, 8],
            nutrition: [6, 7, 8, 7, 8],
            workouts: [3, 4, 4, 4, 5]
          },
          improvements: {
            sleep: 15,
            nutrition: 20,
            workouts: 25
          }
        }
      });

      // Save the submission which will trigger analytics and AI suggestions
      await saveFormSubmission(submission);

      // Update state with created data
      setCreatedData({
        coach,
        client,
        form,
        submission
      });

      // Display success message
      alert('Test data created successfully! You can now view the client details.');

    } catch (error) {
      console.error('Error creating test data:', error);
      alert('Error creating test data. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F15] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Data Setup</h1>
        
        <button
          onClick={handleCreateTestData}
          disabled={isLoading}
          className={`
            w-full py-3 px-4 rounded-lg font-medium
            ${isLoading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
          {isLoading ? 'Creating Test Data...' : 'Create Test Data'}
        </button>

        {Object.keys(createdData).length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Created Data</h2>
            <pre className="bg-gray-800 p-4 rounded-lg overflow-auto">
              {JSON.stringify(createdData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 