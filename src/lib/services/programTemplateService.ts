import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { ProgramTemplate } from '@/types/program';

const COLLECTION = 'programTemplates';

export const programTemplateService = {
  async createTemplate(template: Omit<ProgramTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProgramTemplate> {
    try {
      const templateRef = doc(collection(db, COLLECTION));
      const newTemplate: ProgramTemplate = {
        ...template,
        id: templateRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(templateRef, {
        ...newTemplate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return newTemplate;
    } catch (error) {
      console.error('Error creating program template:', error);
      throw error;
    }
  },

  async getTemplate(id: string): Promise<ProgramTemplate | null> {
    try {
      const templateRef = doc(db, COLLECTION, id);
      const templateDoc = await getDoc(templateRef);

      if (!templateDoc.exists()) {
        return null;
      }

      return {
        ...templateDoc.data(),
        id: templateDoc.id,
        createdAt: templateDoc.data().createdAt?.toDate(),
        updatedAt: templateDoc.data().updatedAt?.toDate()
      } as ProgramTemplate;
    } catch (error) {
      console.error('Error getting program template:', error);
      throw error;
    }
  },

  async listTemplates(options: {
    category?: string;
    status?: string;
    lastDoc?: DocumentSnapshot;
    limit?: number;
  } = {}): Promise<{
    templates: ProgramTemplate[];
    lastDoc: DocumentSnapshot | null;
  }> {
    try {
      let q = collection(db, COLLECTION);
      const constraints = [];

      if (options.category) {
        constraints.push(where('category', '==', options.category));
      }

      if (options.status) {
        constraints.push(where('metadata.status', '==', options.status));
      }

      constraints.push(orderBy('createdAt', 'desc'));
      
      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      if (options.lastDoc) {
        constraints.push(startAfter(options.lastDoc));
      }

      q = query(q, ...constraints);
      const querySnapshot = await getDocs(q);

      const templates = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as ProgramTemplate[];

      return {
        templates,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null
      };
    } catch (error) {
      console.error('Error listing program templates:', error);
      throw error;
    }
  },

  async updateTemplate(id: string, updates: Partial<ProgramTemplate>): Promise<void> {
    try {
      const templateRef = doc(db, COLLECTION, id);
      await updateDoc(templateRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating program template:', error);
      throw error;
    }
  },

  async deleteTemplate(id: string): Promise<void> {
    try {
      const templateRef = doc(db, COLLECTION, id);
      await deleteDoc(templateRef);
    } catch (error) {
      console.error('Error deleting program template:', error);
      throw error;
    }
  },

  async duplicateTemplate(id: string, newTitle: string): Promise<ProgramTemplate> {
    try {
      const template = await this.getTemplate(id);
      if (!template) {
        throw new Error('Template not found');
      }

      const { id: _, metadata, ...templateData } = template;
      return await this.createTemplate({
        ...templateData,
        title: newTitle,
        metadata: {
          ...metadata,
          status: 'draft',
          version: '1.0.0'
        }
      });
    } catch (error) {
      console.error('Error duplicating program template:', error);
      throw error;
    }
  }
}; 