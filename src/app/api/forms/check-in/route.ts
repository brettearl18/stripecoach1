import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase-admin';
import { FormSubmission, FormTemplate } from '@/types/forms';

export async function GET(request: Request) {
  try {
    const sessionCookie = request.headers.get('session') || '';
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;

    // Get the check-in form template
    const templateDoc = await db
      .collection('formTemplates')
      .where('name', '==', 'check-in')
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (templateDoc.empty) {
      return NextResponse.json(
        { error: 'No active check-in form template found' },
        { status: 404 }
      );
    }

    const template = templateDoc.docs[0].data() as FormTemplate;

    // Get the user's last submission if any
    const lastSubmissionDoc = await db
      .collection('formSubmissions')
      .where('templateId', '==', template.id)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    const lastSubmission = lastSubmissionDoc.empty
      ? null
      : (lastSubmissionDoc.docs[0].data() as FormSubmission);

    return NextResponse.json({
      template,
      lastSubmission,
    });
  } catch (error) {
    console.error('Error fetching check-in form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const sessionCookie = request.headers.get('session') || '';
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;

    const body = await request.json();
    const { templateId, answers } = body;

    if (!templateId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the form submission
    const submission: Omit<FormSubmission, 'id'> = {
      templateId,
      userId,
      answers,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const submissionRef = await db.collection('formSubmissions').add(submission);

    // Calculate metrics for the submission
    const templateDoc = await db.collection('formTemplates').doc(templateId).get();
    const template = templateDoc.data() as FormTemplate;

    const metrics = calculateMetrics(answers, template);

    // Update the submission with metrics
    await submissionRef.update({
      metrics,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      id: submissionRef.id,
      ...submission,
      metrics,
    });
  } catch (error) {
    console.error('Error submitting check-in form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateMetrics(
  answers: FormSubmission['answers'],
  template: FormTemplate
) {
  const categoryScores: { [key: string]: number } = {};
  const categoryCounts: { [key: string]: number } = {};

  // Initialize category scores and counts
  template.categories.forEach((category) => {
    categoryScores[category.id] = 0;
    categoryCounts[category.id] = 0;
  });

  // Calculate scores for each answer
  answers.forEach((answer) => {
    const question = template.questions.find((q) => q.id === answer.questionId);
    if (!question) return;

    const category = template.categories.find(
      (c) => c.id === question.categoryId
    );
    if (!category) return;

    let score = 0;
    switch (question.type) {
      case 'rating':
        score = answer.value as number;
        break;
      case 'number':
        const value = answer.value as number;
        const min = question.min || 0;
        const max = question.max || 100;
        score = ((value - min) / (max - min)) * 5; // Normalize to 0-5 scale
        break;
      case 'checkbox':
        score = answer.value as boolean ? 5 : 0;
        break;
      case 'select':
      case 'multiselect':
        // For these types, we'll use a simple scoring based on the number of options selected
        const selectedOptions = Array.isArray(answer.value)
          ? answer.value
          : [answer.value];
        score = (selectedOptions.length / (question.options?.length || 1)) * 5;
        break;
    }

    categoryScores[category.id] += score;
    categoryCounts[category.id]++;
  });

  // Calculate average scores for each category
  const metrics = template.categories.map((category) => {
    const count = categoryCounts[category.id];
    const score = count > 0 ? categoryScores[category.id] / count : 0;
    return {
      category: category.id,
      score,
      trend: 'neutral', // This would be calculated based on historical data
    };
  });

  // Calculate overall score
  const totalScore =
    metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length;

  return {
    totalScore,
    categoryScores: metrics,
  };
} 