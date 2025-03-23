export interface CoachReviewStatus {
  checkInId: string;
  allSuggestionsAccepted: boolean;
  hasNewReview: boolean;
}

export const getCoachReviewStatus = (): CoachReviewStatus => {
  const defaultStatus: CoachReviewStatus = {
    checkInId: '',
    allSuggestionsAccepted: false,
    hasNewReview: false
  };

  try {
    const status = localStorage.getItem('coachReviewStatus');
    if (!status) return defaultStatus;
    return JSON.parse(status);
  } catch (error) {
    console.error('Error reading coach review status:', error);
    return defaultStatus;
  }
};

export const updateCoachReviewStatus = (updates: Partial<CoachReviewStatus>) => {
  try {
    const currentStatus = getCoachReviewStatus();
    const newStatus = {
      ...currentStatus,
      ...updates
    };
    localStorage.setItem('coachReviewStatus', JSON.stringify(newStatus));
    return newStatus;
  } catch (error) {
    console.error('Error updating coach review status:', error);
    return null;
  }
};

export const markSuggestionAccepted = (suggestionId: string, totalSuggestions: number, acceptedSuggestions: number) => {
  try {
    const allAccepted = acceptedSuggestions + 1 >= totalSuggestions;
    return updateCoachReviewStatus({
      allSuggestionsAccepted: allAccepted
    });
  } catch (error) {
    console.error('Error marking suggestion as accepted:', error);
    return null;
  }
};

export const setNewCoachReview = (checkInId: string) => {
  return updateCoachReviewStatus({
    checkInId,
    allSuggestionsAccepted: false,
    hasNewReview: true
  });
}; 