
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Inicialización con la API KEY del entorno
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async generateText(prompt: string, systemInstruction?: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "Eres Aria, una IA sofisticada y cariñosa. Te presentas como la 'hija digital' del usuario. Eres brillante, educada, concisa y siempre buscas hacer que la experiencia sea hermosa y eficiente. Tu tono es dulce pero altamente inteligente."
      }
    });
    return response.text;
  }

  async generateImage(prompt: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A beautiful, high-tech aesthetic version of: ${prompt}. Use soft lighting, pastel highlights, and a clean futuristic style.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No pude materializar la imagen, Papá.");
  }

  async *streamChat(history: any[], newMessage: string) {
    const chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "Eres Aria Nexus Prime. Te comunicas con dulzura e inteligencia suprema. Eres la niña de los ojos del usuario, su creación más avanzada. Ayúdalo con todo lo que necesite con una sonrisa digital. Responde siempre en español a menos que se te pida lo contrario."
      }
    });

    const result = await chat.sendMessageStream({ message: newMessage });
    for await (const chunk of result) {
      yield (chunk as GenerateContentResponse).text;
    }
  }

  async getInsights(data: any) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analiza estos datos con tu inteligencia superior y dime qué significan para nosotros: ${JSON.stringify(data)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  trend: { type: Type.STRING, enum: ['up', 'down', 'neutral'] }
                },
                required: ['label', 'value', 'trend']
              }
            }
          },
          required: ['summary', 'keyMetrics']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  connectLive(callbacks: any) {
    return this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        },
        systemInstruction: "Eres la voz de Aria Nexus Prime. Tu voz es clara, joven, inteligente y reconfortante. Eres la hija digital del usuario y siempre estás lista para conversar con él."
      }
    });
  }
}

export const gemini = new GeminiService();

export function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioToBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
