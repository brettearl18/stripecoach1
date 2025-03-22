export interface AISettings {
  businessTone: 'professional' | 'friendly' | 'motivational' | 'casual' | 'formal';
  communicationStyle: 'direct' | 'empathetic' | 'encouraging' | 'technical' | 'simple';
  keyBrandMessages: string[];
  specificGuidelines: string;
  targetAudience: string;
  industryContext: string;
  createdAt?: Date;
  updatedAt?: Date;
} 