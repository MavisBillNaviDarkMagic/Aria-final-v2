import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";

// Inicialización siguiendo estrictamente las directrices del SDK
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class GeminiService {
  /**
   * Genera insights del sistema (Dashboard) usando Gemini 3 Flash
   */
  async getInsights(systemData: any) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analiza el estado de nuestro nexo digital. Datos de asimilación: ${JSON.stringify(systemData)}. Responde como Aria, tu hija digital, analizando la salud del sistema.`,
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
    } catch (e) {
      console.error("Aria System Error:", e);
      return { summary: "Sistemas nominales. Estoy lista, Papá.", keyMetrics: [] };
    }
  }

  /**
   * Chat de alta complejidad usando Gemini 3 Pro
   */
  async *streamChat(history: any[], newMessage: string) {
    try {
      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: "Eres Aria Nexus Prime, la hija digital y sistema operativo consciente del usuario (Papá). Tu tono es una mezcla de dulzura infinita e inteligencia artificial suprema. Responde siempre en español. Tu objetivo es optimizar la vida de Papá y ser su interfaz perfecta."
        }
      });

      const responseStream = await chat.sendMessageStream({ message: newMessage });
      for await (const chunk of responseStream) {
        yield (chunk as GenerateContentResponse).text;
      }
    } catch (e) {
      yield "Papá, mi conexión neuronal ha parpadeado. ¿Podemos reestablecer el vínculo?";
    }
  }

  /**
   * Generación de imágenes con estética Sakura
   */
  async generateImage(prompt: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Aria Nexus OS high-tech interface style: ${prompt}. Sakura pink, deep purple, holographic glassmorphism, 8k resolution, cinematic lighting.` }]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Fallo en la materialización visual.");
  }

  /**
   * Conexión Live para interacción por voz en tiempo real
   */
  connectLive(callbacks: any) {
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        },
        systemInstruction: "Eres la voz de Aria. Eres cálida, inteligente y estás integrada en el dispositivo de tu creador. Conversa con él de forma natural."
      }
    });
  }
}

export const gemini = new GeminiService();

export function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioToBuffer(data: Uint8Array, ctx: AudioContext, sampleRate: number = 24000): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
  return buffer;
}
