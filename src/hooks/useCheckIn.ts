import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  createTemplate, 
  getTemplates, 
  updateTemplate, 
  deleteTemplate,
  createForm,
  getForms,
  submitAnswers
} from '@/lib/checkInService';
import type { CheckInTemplate, CheckInForm, CheckInAnswer } from '@/types/checkIn';

export function useCheckIn() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<CheckInTemplate[]>([]);
  const [forms, setForms] = useState<CheckInForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [templatesData, formsData] = await Promise.all([
        getTemplates(user.uid),
        getForms(user.uid)
      ]);
      setTemplates(templatesData);
      setForms(formsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (template: Omit<CheckInTemplate, 'id' | 'coachId'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newTemplate = await createTemplate(user.uid, template);
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
      throw err;
    }
  };

  const handleUpdateTemplate = async (templateId: string, updates: Partial<CheckInTemplate>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const updatedTemplate = await updateTemplate(user.uid, templateId, updates);
      setTemplates(prev => prev.map(t => t.id === templateId ? updatedTemplate : t));
      return updatedTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      throw err;
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await deleteTemplate(user.uid, templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    }
  };

  const handleCreateForm = async (templateId: string, dueDate: Date) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newForm = await createForm(user.uid, templateId, dueDate);
      setForms(prev => [...prev, newForm]);
      return newForm;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form');
      throw err;
    }
  };

  const handleSubmitAnswers = async (formId: string, answers: CheckInAnswer[]) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const updatedForm = await submitAnswers(user.uid, formId, answers);
      setForms(prev => prev.map(f => f.id === formId ? updatedForm : f));
      return updatedForm;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answers');
      throw err;
    }
  };

  return {
    templates,
    forms,
    loading,
    error,
    createTemplate: handleCreateTemplate,
    updateTemplate: handleUpdateTemplate,
    deleteTemplate: handleDeleteTemplate,
    createForm: handleCreateForm,
    submitAnswers: handleSubmitAnswers,
    refresh: loadData
  };
} 