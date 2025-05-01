import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

export async function createTestClient() {
  try {
    const clientRef = doc(db, 'clients', 'test-client');
    await setDoc(clientRef, {
      name: 'Test Client',
      email: 'test@example.com',
      role: 'client',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return 'test-client';
  } catch (error) {
    console.error('Error creating test client:', error);
    throw error;
  }
}

export async function createTestCheckInForm() {
  try {
    const formRef = doc(db, 'checkInForms', 'test-form');
    await setDoc(formRef, {
      title: 'Test Check-in Form',
      description: 'A test check-in form',
      questions: [
        {
          id: '1',
          type: 'text',
          question: 'How are you feeling today?',
          required: true
        },
        {
          id: '2',
          type: 'number',
          question: 'Rate your energy level (1-10)',
          required: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return 'test-form';
  } catch (error) {
    console.error('Error creating test check-in form:', error);
    throw error;
  }
}

export async function createTestFormSubmission() {
  try {
    const submissionRef = doc(db, 'formSubmissions', 'test-submission');
    await setDoc(submissionRef, {
      formId: 'test-form',
      clientId: 'test-client',
      responses: [
        {
          questionId: '1',
          answer: 'Feeling great!'
        },
        {
          questionId: '2',
          answer: '8'
        }
      ],
      submittedAt: new Date().toISOString()
    });
    return 'test-submission';
  } catch (error) {
    console.error('Error creating test form submission:', error);
    throw error;
  }
} 