import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, limit, getDoc, Timestamp, DocumentData, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Types and Interfaces
export interface Coach {
  id?: string;
  name: string;
  email: string;
  specialties: string[];
  experience: string;
  createdAt?: Date;
  updatedAt?: Date;
  isTestData?: boolean;
}

export interface Client {
  id?: string;
  name: string;
  email: string;
  coachId: string;
  status?: 'active' | 'inactive';
  goals: string[];
  preferences: {
    focusAreas: string[];
    communicationFrequency: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CheckInForm {
  id?: string;
  title: string;
  description: string;
  questions: Array<{
    id: number;
    text: string;
    type: 'text' | 'scale' | 'multiple_choice';
    required: boolean;
    options?: {
      min?: number;
      max?: number;
      labels?: {
        min: string;
        max: string;
      };
    } | string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormSubmission {
  id?: string;
  formId: string;
  clientId: string;
  submittedAt: Date;
  answers: {
    [key: string]: string | number;
  };
  metrics?: {
    completionTime: number;
    questionsAnswered: number;
    requiredQuestionsAnswered: number;
  };
  analytics?: {
    consistencyScore: number;
    trends: {
      [key: string]: number[];
    };
    improvements: {
      [key: string]: number;
    };
  };
}

export interface ClientAnalytics {
  id?: string;
  clientId: string;
  formId: string;
  submissions: number;
  averageCompletionTime: number;
  completionRate: number;
  trends: {
    [key: string]: number[];
  };
  improvements: {
    [key: string]: number;
  };
  consistencyScore: number;
  lastSubmission: Date;
}

export interface AICoachingSuggestion {
  id?: string;
  clientId: string;
  formId: string;
  submissionId: string;
  suggestions: Array<{
    category: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
    basedOn: Array<{
      question: string;
      answer: any;
      trend?: string;
    }>;
  }>;
  createdAt: Date;
}

// Helper function to convert dates to Firestore Timestamps
const convertDatesToTimestamps = (data: any): DocumentData => {
  const result = { ...data };
  for (const [key, value] of Object.entries(result)) {
    if (value instanceof Date) {
      result[key] = Timestamp.fromDate(value);
    } else if (value && typeof value === 'object') {
      result[key] = convertDatesToTimestamps(value);
    }
  }
  return result;
};

export const saveFormSubmission = async (
  submission: FormSubmission,
  previousSubmissions?: FormSubmission[]
): Promise<string> => {
  try {
    // Calculate metrics
    const metrics = calculateSubmissionMetrics(submission);
    const analytics = await calculateAnalytics(submission, previousSubmissions);

    const submissionWithMetrics = {
      ...submission,
      metrics,
      analytics,
      submittedAt: new Date()
    };

    // Save submission
    const submissionsCollection = collection(db, 'formSubmissions');
    const docRef = await addDoc(submissionsCollection, submissionWithMetrics);

    // Update client analytics
    await updateClientAnalytics(submission.clientId, submissionWithMetrics);

    // Generate AI coaching suggestions
    await generateAndSaveAISuggestions(submissionWithMetrics, previousSubmissions);

    return docRef.id;
  } catch (error) {
    console.error('Error saving form submission:', error);
    throw error;
  }
};

const calculateSubmissionMetrics = (submission: FormSubmission) => {
  // Calculate basic metrics
  return {
    completionTime: 0, // This should be passed from the client
    questionsAnswered: Object.keys(submission.answers).length,
    requiredQuestionsAnswered: Object.keys(submission.answers).length // This should be filtered for required questions
  };
};

const calculateAnalytics = async (
  submission: FormSubmission,
  previousSubmissions?: FormSubmission[]
): Promise<FormSubmission['analytics']> => {
  if (!previousSubmissions) {
    previousSubmissions = await getFormSubmissions(submission.formId, submission.clientId);
  }

  // Group answers by category
  const categoryValues: Record<string, number[]> = {};
  const improvements: Record<string, number> = {};

  // Calculate trends and improvements
  // This is a simplified example - you would want to make this more sophisticated
  let consistencyScore = 100;

  return {
    trends: categoryValues,
    improvements,
    consistencyScore
  };
};

const updateClientAnalytics = async (
  clientId: string,
  submission: FormSubmission
): Promise<void> => {
  try {
    const analyticsCollection = collection(db, 'clientAnalytics');
    const q = query(analyticsCollection, where('clientId', '==', clientId));
    const snapshot = await getDocs(q);

    let analytics: ClientAnalytics;
    if (snapshot.empty) {
      analytics = {
        clientId,
        formId: '',
        submissions: 0,
        averageCompletionTime: 0,
        completionRate: 0,
        trends: {},
        improvements: {},
        consistencyScore: 100,
        lastSubmission: new Date()
      };
    } else {
      analytics = snapshot.docs[0].data() as ClientAnalytics;
    }

    // Update check-in history
    analytics.submissions++;
    analytics.averageCompletionTime = ((analytics.averageCompletionTime * (analytics.submissions - 1) + submission.metrics.completionTime) / analytics.submissions);
    analytics.completionRate = ((analytics.completionRate * (analytics.submissions - 1) + (submission.metrics.requiredQuestionsAnswered / submission.metrics.questionsAnswered)) / analytics.submissions);
    analytics.lastSubmission = submission.submittedAt;

    // Update or create analytics document
    if (snapshot.empty) {
      await addDoc(analyticsCollection, analytics);
    } else {
      await updateDoc(snapshot.docs[0].ref, analytics);
    }
  } catch (error) {
    console.error('Error updating client analytics:', error);
    throw error;
  }
};

const generateAndSaveAISuggestions = async (
  submission: FormSubmission,
  previousSubmissions?: FormSubmission[]
): Promise<void> => {
  try {
    const suggestionsCollection = collection(db, 'aiCoachingSuggestions');

    // Get the form to understand the questions
    const formRef = doc(db, 'checkInForms', submission.formId);
    const formDoc = await getDoc(formRef);
    const form = formDoc.data() as CheckInForm;

    // Prepare the data for OpenAI
    const questionAnswers = form.questions.map(q => ({
      question: q.text,
      answer: submission.answers[q.id],
      type: q.type,
      required: q.required
    }));

    // Get previous answers for trend analysis
    const previousAnswers = previousSubmissions?.map(s => 
      form.questions.map(q => ({
        question: q.text,
        answer: s.answers[q.id]
      }))
    ) || [];

    // Create the prompt for OpenAI
    const prompt = `As a fitness coach, analyze this client's check-in responses and provide personalized suggestions.
    
Current Responses:
${questionAnswers.map(qa => `- ${qa.question}: ${qa.answer}`).join('\n')}

Previous Responses (if any):
${previousAnswers.map((answers, index) => 
  `Week ${index + 1}:\n${answers.map(qa => `- ${qa.question}: ${qa.answer}`).join('\n')}`
).join('\n\n')}

Analytics:
- Completion Time: ${submission.metrics.completionTime} seconds
- Questions Answered: ${submission.metrics.questionsAnswered}/${form.questions.length}
- Required Questions Answered: ${submission.metrics.requiredQuestionsAnswered}/${form.questions.filter(q => q.required).length}
- Consistency Score: ${submission.analytics?.consistencyScore || 100}

Please provide 2-3 specific, actionable suggestions for improvement. For each suggestion:
1. Identify the category (e.g., Performance, Nutrition, Recovery, Consistency)
2. Provide a clear, actionable suggestion
3. Explain why this suggestion is important
4. Set a priority level (high, medium, low)
5. Reference specific responses that led to this suggestion

Format the response as JSON with the following structure:
{
  "suggestions": [
    {
      "category": "string",
      "suggestion": "string",
      "priority": "high" | "medium" | "low",
      "basedOn": [
        {
          "question": "string",
          "answer": "any",
          "trend": "string"
        }
      ]
    }
  ]
}`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an experienced fitness coach providing personalized suggestions based on client check-in data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI suggestions');
    }

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);

    // Create the suggestion document
    const suggestion: AICoachingSuggestion = {
      clientId: submission.clientId,
      formId: submission.formId,
      submissionId: submission.id!,
      suggestions: aiResponse.suggestions,
      createdAt: new Date()
    };

    // Save the suggestions
    await addDoc(suggestionsCollection, suggestion);
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    throw error;
  }
};

function analyzeTrend(values: number[]): 'improving' | 'declining' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const changes = [];
  for (let i = 1; i < values.length; i++) {
    changes.push(values[i] - values[i - 1]);
  }
  
  const averageChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  
  if (Math.abs(averageChange) < 0.1) return 'stable';
  return averageChange > 0 ? 'improving' : 'declining';
}

export const getClientAnalytics = async (clientId: string): Promise<ClientAnalytics | null> => {
  try {
    const analyticsCollection = collection(db, 'clientAnalytics');
    const q = query(analyticsCollection, where('clientId', '==', clientId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as ClientAnalytics;
  } catch (error) {
    console.error('Error getting client analytics:', error);
    throw error;
  }
};

export const getAISuggestions = async (
  clientId: string,
  status?: AICoachingSuggestion['status']
): Promise<AICoachingSuggestion[]> => {
  try {
    const suggestionsCollection = collection(db, 'aiCoachingSuggestions');
    let q = query(
      suggestionsCollection,
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AICoachingSuggestion[];
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    throw error;
  }
};

export const getFormSubmissions = async (formId?: string, clientId?: string): Promise<FormSubmission[]> => {
  try {
    const submissionsCollection = collection(db, 'formSubmissions');
    let q = submissionsCollection;
    
    if (formId && clientId) {
      q = query(submissionsCollection, 
        where('formId', '==', formId),
        where('clientId', '==', clientId)
      );
    } else if (formId) {
      q = query(submissionsCollection, where('formId', '==', formId));
    } else if (clientId) {
      q = query(submissionsCollection, where('clientId', '==', clientId));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FormSubmission[];
  } catch (error) {
    console.error('Error getting form submissions:', error);
    throw error;
  }
};

// Test data creation functions
export const createTestCoach = async (coachData: Partial<Coach>): Promise<Coach> => {
  try {
    const coachRef = collection(db, 'coaches');
    const specialties = Array.isArray(coachData.specialties) ? coachData.specialties : 
                       (typeof coachData.specialties === 'string' ? coachData.specialties.split(',').map(s => s.trim()) : 
                       ['General Fitness']);
    
    const newCoach: Coach = {
      name: coachData.name || 'Test Coach',
      email: coachData.email || `test-coach-${Date.now()}@example.com`,
      specialties,
      experience: coachData.experience || '5+ years',
      createdAt: new Date(),
      updatedAt: new Date(),
      isTestData: true
    };

    const docRef = await addDoc(coachRef, convertDatesToTimestamps(newCoach));
    const createdCoach = { ...newCoach, id: docRef.id };
    await updateDoc(docRef, { id: docRef.id });
    return createdCoach;
  } catch (error) {
    console.error('Error creating test coach:', error);
    throw error;
  }
};

export const createTestClient = async (data: Client): Promise<Client> => {
  const clientData = {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const docRef = await addDoc(collection(db, 'clients'), convertDatesToTimestamps(clientData));
  return { ...clientData, id: docRef.id };
};

export const createTestCheckInForm = async (data: CheckInForm): Promise<CheckInForm> => {
  const formData = {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const docRef = await addDoc(collection(db, 'forms'), convertDatesToTimestamps(formData));
  return { ...formData, id: docRef.id };
};

export const createTestFormSubmission = async (data: FormSubmission): Promise<FormSubmission> => {
  const submissionData = {
    ...data,
    submittedAt: data.submittedAt || new Date()
  };
  
  const docRef = await addDoc(collection(db, 'submissions'), convertDatesToTimestamps(submissionData));
  return { ...submissionData, id: docRef.id };
};

// CRUD operations for coaches
export const getCoach = async (id: string): Promise<Coach | null> => {
  const docRef = doc(db, 'coaches', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Coach : null;
};

export const getCoaches = async (): Promise<Coach[]> => {
  try {
    const coachesRef = collection(db, 'coaches');
    const querySnapshot = await getDocs(coachesRef);
    const coaches = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        specialties: Array.isArray(data.specialties) ? data.specialties : [],
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Coach;
    });

    // If no coaches exist, create test coaches
    if (coaches.length === 0) {
      const testCoaches = [
        {
          name: 'Sarah Johnson',
          email: 'sarah.j@stripecoach.com',
          specialties: ['Nutrition', 'Weight Loss', 'Meal Planning'],
          experience: '8 years in nutrition and fitness coaching'
        },
        {
          name: 'Michael Chen',
          email: 'michael.c@stripecoach.com',
          specialties: ['Strength Training', 'Athletic Performance', 'Injury Recovery'],
          experience: '12 years as athletic trainer'
        },
        {
          name: 'Emma Williams',
          email: 'emma.w@stripecoach.com',
          specialties: ['Mental Health', 'Stress Management', 'Life Balance'],
          experience: '6 years in wellness coaching'
        }
      ];

      const createdCoaches = await Promise.all(
        testCoaches.map(coach => createTestCoach(coach))
      );

      return createdCoaches;
    }

    return coaches;
  } catch (error) {
    console.error('Error getting coaches:', error);
    throw error;
  }
};

export const updateCoach = async (id: string, data: Partial<Coach>): Promise<void> => {
  const docRef = doc(db, 'coaches', id);
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
};

export const deleteCoach = async (id: string): Promise<void> => {
  const docRef = doc(db, 'coaches', id);
  await deleteDoc(docRef);
};

// CRUD operations for clients
export const getClient = async (id: string): Promise<Client | null> => {
  const docRef = doc(db, 'clients', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Client : null;
};

export const getClients = async (): Promise<Client[]> => {
  try {
    const clientsCollection = collection(db, 'clients');
    const snapshot = await getDocs(clientsCollection);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        goals: Array.isArray(data.goals) ? data.goals : [],
        status: data.status || 'inactive',
        preferences: {
          focusAreas: Array.isArray(data.preferences?.focusAreas) ? data.preferences.focusAreas : [],
          communicationFrequency: data.preferences?.communicationFrequency || 'weekly'
        }
      } as Client;
    });
  } catch (error) {
    console.error('Error getting clients:', error);
    throw error;
  }
};

export const getClientsByCoach = async (coachId: string): Promise<Client[]> => {
  const q = query(collection(db, 'clients'), where('coachId', '==', coachId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Client);
};

export const updateClient = async (id: string, data: Partial<Client>): Promise<void> => {
  const docRef = doc(db, 'clients', id);
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
};

export const deleteClient = async (id: string): Promise<void> => {
  const docRef = doc(db, 'clients', id);
  await deleteDoc(docRef);
};

// CRUD operations for forms
export const getForm = async (id: string): Promise<CheckInForm | null> => {
  const docRef = doc(db, 'forms', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as CheckInForm : null;
};

export const updateForm = async (id: string, data: Partial<CheckInForm>): Promise<void> => {
  const docRef = doc(db, 'forms', id);
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
};

export const deleteForm = async (id: string): Promise<void> => {
  const docRef = doc(db, 'forms', id);
  await deleteDoc(docRef);
};

// CRUD operations for submissions
export const getSubmission = async (id: string): Promise<FormSubmission | null> => {
  const docRef = doc(db, 'submissions', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as FormSubmission : null;
};

export const getSubmissionsByForm = async (formId: string): Promise<FormSubmission[]> => {
  const q = query(collection(db, 'submissions'), where('formId', '==', formId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FormSubmission);
};

export const getSubmissionsByClient = async (clientId: string): Promise<FormSubmission[]> => {
  const q = query(collection(db, 'submissions'), where('clientId', '==', clientId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FormSubmission);
};

export const updateSubmission = async (id: string, data: Partial<FormSubmission>): Promise<void> => {
  const docRef = doc(db, 'submissions', id);
  await updateDoc(docRef, convertDatesToTimestamps(data));
};

export const deleteSubmission = async (id: string): Promise<void> => {
  const docRef = doc(db, 'submissions', id);
  await deleteDoc(docRef);
};

// Form operations
export const saveCheckInForm = async (form: CheckInForm): Promise<string> => {
  const formData = {
    ...form,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const formsCollection = collection(db, 'forms');
  const docRef = await addDoc(formsCollection, convertDatesToTimestamps(formData));
  return docRef.id;
};

export const getCheckInForms = async (): Promise<CheckInForm[]> => {
  try {
    const formsRef = collection(db, 'forms');
    const querySnapshot = await getDocs(formsRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CheckInForm));
  } catch (error) {
    console.error('Error getting check-in forms:', error);
    throw error;
  }
};

export const updateCheckInForm = async (id: string, data: Partial<CheckInForm>): Promise<void> => {
  const docRef = doc(db, 'forms', id);
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
};

export const deleteCheckInForm = async (id: string): Promise<void> => {
  const docRef = doc(db, 'forms', id);
  await deleteDoc(docRef);
};

export async function getUnassignedClients(): Promise<Client[]> {
  try {
    const clientsRef = collection(db, 'clients');
    const q = query(clientsRef, where('coachId', '==', ''));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Client));
  } catch (error) {
    console.error('Error getting unassigned clients:', error);
    throw error;
  }
}

export async function assignClientsToCoach(clientIds: string[], coachId: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    const clientsRef = collection(db, 'clients');

    for (const clientId of clientIds) {
      const clientRef = doc(clientsRef, clientId);
      batch.update(clientRef, {
        coachId: coachId,
        updatedAt: new Date()
      });
    }

    await batch.commit();
  } catch (error) {
    console.error('Error assigning clients to coach:', error);
    throw error;
  }
}

export async function unassignClientFromCoach(clientId: string): Promise<void> {
  try {
    const clientRef = doc(db, 'clients', clientId);
    await updateDoc(clientRef, {
      coachId: '',
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error unassigning client from coach:', error);
    throw error;
  }
}

export async function createTestData() {
  try {
    // Create 3 coaches
    const coaches = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        specialties: ['Weight Loss', 'Nutrition', 'Personal Training'],
        experience: '5 years',
        bio: 'Certified personal trainer and nutrition specialist'
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        specialties: ['Strength Training', 'Sports Performance', 'Rehabilitation'],
        experience: '8 years',
        bio: 'Former professional athlete turned strength coach'
      },
      {
        name: 'Emma Rodriguez',
        email: 'emma.rodriguez@example.com',
        specialties: ['Yoga', 'Mindfulness', 'Wellness'],
        experience: '6 years',
        bio: 'Yoga instructor and wellness coach'
      }
    ];

    // Create coaches using createTestCoach
    const createdCoaches = await Promise.all(
      coaches.map(coach => createTestCoach(coach))
    );

    // Create 5 clients for each coach
    const batch = writeBatch(db);
    const clientNames = [
      ['John Smith', 'Alice Brown', 'David Wilson', 'Lisa Anderson', 'Robert Taylor'],
      ['James Miller', 'Emily Davis', 'William Johnson', 'Sophia Lee', 'Daniel White'],
      ['Olivia Parker', 'Lucas Thompson', 'Ava Martinez', 'Ethan Clark', 'Mia Garcia']
    ];

    for (let i = 0; i < createdCoaches.length; i++) {
      const coach = createdCoaches[i];
      const names = clientNames[i];

      for (const name of names) {
        const clientRef = doc(collection(db, 'clients'));
        const clientData = {
          name,
          email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
          coachId: coach.id,
          goals: ['Fitness', 'Health', 'Wellness'],
          preferences: {
            focusAreas: ['Exercise', 'Nutrition'],
            communicationFrequency: 'weekly'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        batch.set(clientRef, clientData);
      }
    }

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error creating test data:', error);
    throw error;
  }
} 