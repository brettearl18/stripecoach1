interface Question {
  id: string;
  text: string;
  type: 'text' | 'yesNo' | 'multipleChoice' | 'scale' | 'radio';
  required: boolean;
  weight?: number;
  yesIsPositive?: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
  };
}

interface Answer {
  questionId: string;
  value: string | boolean | number;
}

export interface ScoreThresholds {
  red: number;    // Below this percentage is red
  orange: number; // Below this percentage is orange, above is green
}

export interface ScoringTier {
  id: string;
  name: string;
  description: string;
  thresholds: ScoreThresholds;
}

// Predefined scoring tiers
export const SCORING_TIERS: ScoringTier[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'For elite athletes and professionals requiring strict adherence',
    thresholds: {
      red: 0.8,    // Below 80%
      orange: 0.9  // 80-90%, above 90% is green
    }
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'For experienced individuals with high standards',
    thresholds: {
      red: 0.7,    // Below 70%
      orange: 0.85 // 70-85%, above 85% is green
    }
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'For individuals with established habits seeking improvement',
    thresholds: {
      red: 0.6,    // Below 60%
      orange: 0.8  // 60-80%, above 80% is green
    }
  },
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'For individuals starting their journey',
    thresholds: {
      red: 0.5,    // Below 50%
      orange: 0.7  // 50-70%, above 70% is green
    }
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Custom thresholds set by the coach',
    thresholds: {
      red: 0.4,    // Below 40%
      orange: 0.7  // 40-70%, above 70% is green
    }
  }
];

export interface ScoreResult {
  score: number;          // Raw score (sum of weighted answers)
  maxPossibleScore: number; // Maximum possible score
  percentage: number;     // Score as a percentage of max possible
  status: 'red' | 'orange' | 'green'; // Overall status
  breakdown: {
    positivePoints: number;
    negativePoints: number;
    unansweredWeight: number;
  };
}

export class ScoringService {
  /**
   * Calculate the score for a set of answers based on the template questions
   */
  static calculateScore(
    questions: Question[], 
    answers: Answer[], 
    tierThresholds: ScoreThresholds = SCORING_TIERS[3].thresholds // Default to Beginner
  ): ScoreResult {
    let totalScore = 0;
    let maxPossibleScore = 0;
    let positivePoints = 0;
    let negativePoints = 0;
    let unansweredWeight = 0;

    // Process only Yes/No questions with weights
    const scorableQuestions = questions.filter(q => 
      q.type === 'yesNo' && typeof q.weight === 'number'
    );

    for (const question of scorableQuestions) {
      const weight = question.weight || 0;
      const answer = answers.find(a => a.questionId === question.id);
      
      // Add to max possible score
      maxPossibleScore += weight;

      if (!answer) {
        unansweredWeight += weight;
        continue;
      }

      // Calculate points based on answer and whether Yes is positive
      const answerValue = answer.value as boolean;
      const isPositiveAnswer = (answerValue && question.yesIsPositive) || 
                             (!answerValue && !question.yesIsPositive);

      const points = isPositiveAnswer ? weight : 0;
      
      if (isPositiveAnswer) {
        positivePoints += weight;
      } else {
        negativePoints += weight;
      }

      totalScore += points;
    }

    // Calculate percentage (avoid division by zero)
    const percentage = maxPossibleScore > 0 ? 
      (totalScore / maxPossibleScore) : 0;

    // Determine status based on tier thresholds
    let status: ScoreResult['status'] = 'red';
    if (percentage >= tierThresholds.orange) {
      status = 'green';
    } else if (percentage >= tierThresholds.red) {
      status = 'orange';
    }

    return {
      score: totalScore,
      maxPossibleScore,
      percentage,
      status,
      breakdown: {
        positivePoints,
        negativePoints,
        unansweredWeight
      }
    };
  }

  /**
   * Get a human-readable summary of the score
   */
  static getScoreSummary(result: ScoreResult, tier: ScoringTier): string {
    const percentage = Math.round(result.percentage * 100);
    const statusMessages = {
      red: `Needs immediate attention (Below ${tier.thresholds.red * 100}%)`,
      orange: `Room for improvement (${tier.thresholds.red * 100}% - ${tier.thresholds.orange * 100}%)`,
      green: `On track (Above ${tier.thresholds.orange * 100}%)`
    };

    return `${tier.name} Level - Score: ${percentage}% - ${statusMessages[result.status]}
Positive points: ${result.breakdown.positivePoints}
Negative points: ${result.breakdown.negativePoints}
Unanswered weight: ${result.breakdown.unansweredWeight}`;
  }
} 