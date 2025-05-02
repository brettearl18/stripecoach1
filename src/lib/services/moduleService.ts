import { db } from '@/lib/firebase/firebase-client';
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
  serverTimestamp 
} from 'firebase/firestore';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'text' | 'video' | 'quiz' | 'assignment';
  content: string;
  duration: number; // in minutes
  order: number;
  resources: string[]; // Resource IDs
  completedBy?: string[]; // User IDs
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'action' | 'reflection' | 'assessment';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: Date;
  order: number;
  assignedTo?: string[]; // User IDs
  completedBy?: string[]; // User IDs
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  criteria: string[];
  order: number;
  achievedBy?: string[]; // User IDs
}

export interface ProgramModule {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number; // in weeks
  content: {
    lessons: Lesson[];
    tasks: Task[];
    milestones: Milestone[];
  };
  metadata: {
    createdBy: string;
    lastModifiedBy: string;
    version: string;
    status: 'draft' | 'published' | 'archived';
  };
  createdAt: Date;
  updatedAt: Date;
}

export const moduleService = {
  // Create a new module
  async createModule(
    module: Omit<ProgramModule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ProgramModule> {
    try {
      const moduleRef = doc(collection(db, 'modules'));
      const newModule: ProgramModule = {
        ...module,
        id: moduleRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(moduleRef, newModule);
      return newModule;
    } catch (error) {
      console.error('Error creating module:', error);
      throw error;
    }
  },

  // Get a module by ID
  async getModule(id: string): Promise<ProgramModule | null> {
    try {
      const moduleRef = doc(db, 'modules', id);
      const moduleSnap = await getDoc(moduleRef);
      
      if (!moduleSnap.exists()) {
        return null;
      }

      return moduleSnap.data() as ProgramModule;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  },

  // List modules with filtering and pagination
  async listModules(params: {
    programId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ modules: ProgramModule[]; total: number }> {
    try {
      let q = collection(db, 'modules');
      const constraints = [];

      if (params.programId) {
        constraints.push(where('programId', '==', params.programId));
      }

      if (params.status) {
        constraints.push(where('metadata.status', '==', params.status));
      }

      if (params.search) {
        constraints.push(where('title', '>=', params.search));
        constraints.push(where('title', '<=', params.search + '\uf8ff'));
      }

      constraints.push(orderBy('order', 'asc'));

      const page = params.page || 1;
      const limit = params.limit || 10;
      const offset = (page - 1) * limit;

      const querySnapshot = await getDocs(query(q, ...constraints));
      const total = querySnapshot.size;
      const modules = querySnapshot.docs
        .slice(offset, offset + limit)
        .map(doc => ({ id: doc.id, ...doc.data() } as ProgramModule));

      return { modules, total };
    } catch (error) {
      console.error('Error listing modules:', error);
      throw error;
    }
  },

  // Update a module
  async updateModule(
    id: string,
    updates: Partial<ProgramModule>
  ): Promise<ProgramModule> {
    try {
      const moduleRef = doc(db, 'modules', id);
      const moduleSnap = await getDoc(moduleRef);

      if (!moduleSnap.exists()) {
        throw new Error('Module not found');
      }

      const currentModule = moduleSnap.data() as ProgramModule;
      const updatedModule = {
        ...currentModule,
        ...updates,
        updatedAt: new Date()
      };

      await updateDoc(moduleRef, updatedModule);
      return updatedModule;
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  },

  // Delete a module
  async deleteModule(id: string): Promise<void> {
    try {
      const moduleRef = doc(db, 'modules', id);
      const moduleSnap = await getDoc(moduleRef);

      if (!moduleSnap.exists()) {
        throw new Error('Module not found');
      }

      await deleteDoc(moduleRef);
    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  },

  // Add a lesson to a module
  async addLesson(
    moduleId: string,
    lesson: Omit<Lesson, 'id'>
  ): Promise<ProgramModule> {
    try {
      const moduleRef = doc(db, 'modules', moduleId);
      const moduleSnap = await getDoc(moduleRef);

      if (!moduleSnap.exists()) {
        throw new Error('Module not found');
      }

      const module = moduleSnap.data() as ProgramModule;
      const newLesson: Lesson = {
        ...lesson,
        id: `lesson-${Date.now()}`
      };

      const updatedModule = {
        ...module,
        content: {
          ...module.content,
          lessons: [...module.content.lessons, newLesson]
        },
        updatedAt: new Date()
      };

      await updateDoc(moduleRef, updatedModule);
      return updatedModule;
    } catch (error) {
      console.error('Error adding lesson:', error);
      throw error;
    }
  },

  // Add a task to a module
  async addTask(
    moduleId: string,
    task: Omit<Task, 'id'>
  ): Promise<ProgramModule> {
    try {
      const moduleRef = doc(db, 'modules', moduleId);
      const moduleSnap = await getDoc(moduleRef);

      if (!moduleSnap.exists()) {
        throw new Error('Module not found');
      }

      const module = moduleSnap.data() as ProgramModule;
      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`
      };

      const updatedModule = {
        ...module,
        content: {
          ...module.content,
          tasks: [...module.content.tasks, newTask]
        },
        updatedAt: new Date()
      };

      await updateDoc(moduleRef, updatedModule);
      return updatedModule;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  // Add a milestone to a module
  async addMilestone(
    moduleId: string,
    milestone: Omit<Milestone, 'id'>
  ): Promise<ProgramModule> {
    try {
      const moduleRef = doc(db, 'modules', moduleId);
      const moduleSnap = await getDoc(moduleRef);

      if (!moduleSnap.exists()) {
        throw new Error('Module not found');
      }

      const module = moduleSnap.data() as ProgramModule;
      const newMilestone: Milestone = {
        ...milestone,
        id: `milestone-${Date.now()}`
      };

      const updatedModule = {
        ...module,
        content: {
          ...module.content,
          milestones: [...module.content.milestones, newMilestone]
        },
        updatedAt: new Date()
      };

      await updateDoc(moduleRef, updatedModule);
      return updatedModule;
    } catch (error) {
      console.error('Error adding milestone:', error);
      throw error;
    }
  }
}; 