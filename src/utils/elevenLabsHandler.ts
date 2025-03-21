import { AudioMessage } from '@/types/coach';

interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  modelId?: string;
}

interface TextToSpeechRequest {
  text: string;
  voiceId: string;
  modelId?: string;
  voiceSettings?: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
    speaking_rate?: number;
  };
}

export class ElevenLabsHandler {
  private apiKey: string;
  private voiceId: string;
  private modelId: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey;
    this.voiceId = config.voiceId;
    this.modelId = config.modelId || 'eleven_multilingual_v2';  // Using the latest model
  }

  async convertAIResponseToSpeech(text: string): Promise<Blob> {
    const endpoint = `${this.baseUrl}/text-to-speech/${this.voiceId}`;
    
    const request: TextToSpeechRequest = {
      text,
      voiceId: this.voiceId,
      modelId: this.modelId,
      voiceSettings: {
        stability: 0.70,           // Reduced stability to allow more natural accent variation
        similarity_boost: 0.95,    // Increased to better match Silvi's original voice characteristics
        style: 0.35,              // Reduced style to preserve natural accent
        use_speaker_boost: true,   // Keep enhanced clarity
        speaking_rate: 1.0         // Normal speaking rate
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error converting text to speech:', error);
      throw error;
    }
  }

  async generateAIAudioResponse(insights: string): Promise<AudioMessage> {
    try {
      const audioBlob = await this.convertAIResponseToSpeech(insights);
      const timestamp = new Date().toISOString();
      
      // Create a temporary URL for the audio blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Calculate duration (this is approximate as we don't have actual duration until played)
      const estimatedDuration = Math.ceil(insights.length / 15); // Adjusted for slower speaking rate
      
      return {
        id: Date.now(),
        duration: `${Math.floor(estimatedDuration / 60)}:${(estimatedDuration % 60).toString().padStart(2, '0')}`,
        timestamp,
        url: audioUrl,
        isAIGenerated: true
      };
    } catch (error) {
      console.error('Error generating AI audio response:', error);
      throw error;
    }
  }

  private addPausesAndEmphasis(text: string): string {
    // Add more natural pauses and British English phrasing
    return text
      .replace(/([.!?])\s+/g, '$1... ')
      .replace(/(\d+)/g, ' $1 ');  // Add slight spaces around numbers for better pronunciation
  }

  // Helper method to format AI insights into natural speech with better pacing and emphasis
  formatInsightsForSpeech(aiInsights: any): string {
    const clientName = aiInsights.clientName || '';
    const recommendations = aiInsights.recommendations
      .map((rec: string) => this.addPausesAndEmphasis(rec))
      .join('.\n');

    return `
      Hey ${clientName}! Wow, what an amazing week you've had... I'm genuinely proud of your progress!

      ${this.addPausesAndEmphasis(aiInsights.summary)}

      You know what I'm particularly excited about? Let me share a few thoughts on where to focus next:
      ${recommendations}

      ${aiInsights.overallScore >= 80 
        ? "You're absolutely smashing it! Keep this brilliant momentum going." 
        : aiInsights.overallScore >= 60 
        ? "You're making such solid progress. I can see your dedication shining through." 
        : "I know things haven't been easy, but I'm here to support you. Small steps forward are still steps forward."}

      I'd love to chat more about these ideas in our next session. Keep being amazing, ${clientName}!
    `.trim().replace(/\n{3,}/g, '\n\n');  // Clean up excessive newlines
  }
} 