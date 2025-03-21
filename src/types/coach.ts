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