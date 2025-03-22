export interface AudioMessage {
  id: number;
  url?: string;
  duration: string;
  timestamp: string;
  isAIGenerated?: boolean;
}

export interface FileAttachment {
  id: number;
  name: string;
  type: string;
  size: string;
  url?: string;
}

export interface ClientResponse {
  id: number;
  clientName: string;
  category: string;
  metrics: string[];
  generated: string;
  priority: 'high' | 'medium' | 'low';
  audioMessages: AudioMessage[];
  attachments: FileAttachment[];
}

export interface CoachReply {
  responseId: number;
  text?: string;
  audioMessages: AudioMessage[];
  attachments: FileAttachment[];
  timestamp: string;
}

export interface CoachStats {
  activeClients: number;
  pendingResponses: number;
  completionRate: number;
  revenue: number;
  clientProgress: {
    improving: number;
    steady: number;
    declining: number;
  };
}

export interface CoachProfile {
  id: string;
  name: string;
  avatar: string;
  title: string;
  bio: string;
  specialties: string[];
  expertise: {
    category: string;
    description: string;
    yearsOfExperience: number;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
  }[];
  testimonials: {
    id: string;
    clientName: string;
    clientAvatar?: string;
    rating: number;
    content: string;
    date: string;
  }[];
  packages: {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
    features: string[];
    isPopular?: boolean;
  }[];
  availability: {
    timezone: string;
    workingHours: {
      day: string;
      start: string;
      end: string;
    }[];
    bookingLink?: string;
  };
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  contactInfo: {
    email: string;
    website?: string;
    phone?: string;
  };
  stats: {
    totalClients: number;
    yearsCoaching: number;
    successRate: number;
  };
} 