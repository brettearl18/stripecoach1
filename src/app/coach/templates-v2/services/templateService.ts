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
    branding?: {
      primaryColor: string;
      secondaryColor: string;
      logo: string;
      fontFamily: string;
      customCSS: string;
    };
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

      // Save to backend
      const response = await fetch('/api/templates/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draft),
      });

      if (!response.ok) {
        throw new Error('Failed to save template draft');
      }
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

      // Load from backend
      const response = await fetch('/api/templates/drafts');
      if (!response.ok) {
        throw new Error('Failed to load template draft');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to load template draft:', error);
      return null;
    }
  },

  clearDraft: async (): Promise<void> => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      
      // Clear from backend
      const response = await fetch('/api/templates/drafts', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear template draft');
      }
    } catch (error) {
      console.error('Failed to clear template draft:', error);
      throw error;
    }
  },

  importTemplate: async (templateData: any): Promise<void> => {
    try {
      const response = await fetch('/api/templates/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        throw new Error('Failed to import template');
      }
    } catch (error) {
      console.error('Failed to import template:', error);
      throw error;
    }
  },

  validateTemplate: (template: any): boolean => {
    // Required fields
    if (!template.name || !template.sections || !Array.isArray(template.sections)) {
      return false;
    }

    // Validate sections
    for (const section of template.sections) {
      if (!section.title || !section.questions || !Array.isArray(section.questions)) {
        return false;
      }

      // Validate questions
      for (const question of section.questions) {
        if (!question.text || !question.type) {
          return false;
        }
      }
    }

    return true;
  }
}; 