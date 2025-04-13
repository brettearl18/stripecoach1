const STORAGE_KEY = 'template_draft';

export interface TemplateDraft {
  id: string;
  lastModified: number;
  data: {
    name: string;
    description: string;
    category: string;
    tags: string[];
    sections: any[];
    settings: any;
  };
}

export const templateService = {
  saveDraft: async (templateData: TemplateDraft['data']): Promise<void> => {
    const draft: TemplateDraft = {
      id: crypto.randomUUID(),
      lastModified: Date.now(),
      data: templateData
    };

    try {
      // Save to local storage for immediate access
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));

      // Here you would typically also save to your backend
      // await api.post('/api/templates/drafts', draft);
    } catch (error) {
      console.error('Failed to save template draft:', error);
      throw error;
    }
  },

  loadDraft: async (): Promise<TemplateDraft | null> => {
    try {
      // First try to load from local storage
      const localDraft = localStorage.getItem(STORAGE_KEY);
      if (localDraft) {
        return JSON.parse(localDraft);
      }

      // Here you would typically also check your backend
      // const response = await api.get('/api/templates/drafts');
      // return response.data;

      return null;
    } catch (error) {
      console.error('Failed to load template draft:', error);
      return null;
    }
  },

  clearDraft: async (): Promise<void> => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      // Here you would typically also clear from your backend
      // await api.delete('/api/templates/drafts');
    } catch (error) {
      console.error('Failed to clear template draft:', error);
      throw error;
    }
  }
}; 