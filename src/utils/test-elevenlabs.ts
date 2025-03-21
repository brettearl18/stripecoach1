async function testElevenLabsAPI() {
  const API_KEY = 'sk_64ba3b75ac537394786e24da23d734a82b93dadced6d2587';
  const VOICE_ID = 'hvJ0XK5RZZSnokDys4Bh';
  
  try {
    // Test the API key by fetching available voices
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API Key is valid. Available voices:', data);
    
    // Test the voice ID
    const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/voices/${VOICE_ID}`, {
      headers: {
        'xi-api-key': API_KEY
      }
    });
    
    if (!voiceResponse.ok) {
      throw new Error(`Voice ID Error: ${voiceResponse.status} ${voiceResponse.statusText}`);
    }
    
    const voiceData = await voiceResponse.json();
    console.log('Voice ID is valid. Voice details:', voiceData);
    
    // Test a simple text-to-speech conversion
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: "Hi, I'm Silvi, your AI coaching assistant. I'm here to help you track your progress and provide insights.",
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!ttsResponse.ok) {
      throw new Error(`Text-to-speech Error: ${ttsResponse.status} ${ttsResponse.statusText}`);
    }

    console.log('Successfully tested text-to-speech conversion');
    
  } catch (error) {
    console.error('Error testing ElevenLabs configuration:', error);
  }
}

testElevenLabsAPI(); 