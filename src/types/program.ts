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

export interface ResourceReference {
  id: string;
  type: 'document' | 'video' | 'audio' | 'link';
  title: string;
  description: string;
  url: string;
  required: boolean;
}

export interface AssessmentReference {
  id: string;
  type: string;
  title: string;
  description: string;
  frequency: 'once' | 'weekly' | 'monthly' | 'completion';
  required: boolean;
}

export interface NotificationSettings {
  moduleStart: boolean;
  taskDue: boolean;
  milestoneAchieved: boolean;
  assessmentDue: boolean;
  weeklyProgress: boolean;
}

export interface ProgressTrackingSettings {
  trackModuleCompletion: boolean;
  trackAssessments: boolean;
  trackTasks: boolean;
  trackMilestones: boolean;
  requireAllTasks: boolean;
}

export interface ProgramTemplate {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  duration: number; // in weeks
  structure: {
    modules: ProgramModule[];
    resources: ResourceReference[];
    assessments: AssessmentReference[];
  };
  settings: {
    autoAssign: boolean;
    notifications: NotificationSettings;
    progressTracking: ProgressTrackingSettings;
  };
  metadata: {
    createdBy: string;
    lastModifiedBy: string;
    version: string;
    tags: string[];
    status: 'draft' | 'published' | 'archived';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Program extends Omit<ProgramTemplate, 'id' | 'metadata'> {
  id: string;
  templateId: string;
  clientId: string;
  coachId: string;
  startDate: Date;
  endDate: Date;
  progress: {
    currentModule: string;
    completedModules: string[];
    completedTasks: string[];
    achievedMilestones: string[];
    lastActivity: Date;
  };
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  metadata: {
    createdBy: string;
    lastModifiedBy: string;
    version: string;
    notes: string;
  };
} 