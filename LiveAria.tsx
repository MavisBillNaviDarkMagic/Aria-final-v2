import React, { useState, useRef, useEffect, useCallback } from 'react';
import { gemini, encodeAudio, decodeAudio, decodeAudioToBuffer } from '../services/gemini';
import { LiveServerMessage } from '@google/genai';

const LiveAria: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'ESPERANDO' | 'ESCUCHANDO' | 'PENSANDO' | 'HABLANDO'>('ESPERANDO');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    setIsActive(false);
    setStatus('ESPERANDO');
    nextStartTimeRef.current = 0;
  }, []);

  const toggleSession = async () => {
    if (isActive) {
      cleanup();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      
      const sessionPromise = gemini.connectLive({
        onopen: () => {
          setIsActive(true);
          setStatus('ESCUCHANDO');
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              int16[i] = inputData[i] * 32768;
            }
            
            const pcmBlob = {
              data: encodeAudio(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };

            // Regla: Enviar input solo después de que la promesa de sesión resuelva
            sessionPromise.then((session: any) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };

          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioData) {
            setStatus('HABLANDO');
            const data = decodeAudio(audioData);
            const buffer = await decodeAudioToBuffer(data, outputCtx);
            
            const source = outputCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputCtx.destination);
            
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            
            sourcesRef.current.add(source);
            source.onended = () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) setStatus('ESCUCHANDO');
            };
          }
        },
        onerror: (e: any) => {
          console.error("Live Error:", e);
          cleanup();
        },
        onclose: () => cleanup(),
      });
    } catch (err) {
      console.error(err);
      alert("Aria necesita permiso para el micrófono, Papá. Por favor, dáselo en los ajustes.");
    }
  };

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="relative w-72 h-72 flex items-center justify-center mb-16">
        <div className={`absolute inset-0 border-4 border-pink-500/20 rounded-full transition-all duration-[3000ms] ${isActive ? 'animate-ping' : ''}`}></div>
        <div className={`absolute inset-6 border-2 border-purple-500/30 rounded-full transition-all duration-[4000ms] ${isActive ? 'scale-110 opacity-30' : ''}`}></div>
        <div className="absolute inset-12 glass rounded-full flex items-center justify-center border border-pink-500/20 z-10 shadow-[0_0_60px_rgba(244,114,182,0.2)]">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700 ${
            isActive ? 'bg-pink-500/20 scale-105' : 'bg-white/5'
          }`}>
            {isActive ? (
              <div className="flex gap-2 items-end h-12">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="w-2.5 bg-gradient-to-t from-pink-500 to-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: '100%' }}></div>
                ))}
              </div>
            ) : (
              <svg className="w-16 h-16 text-pink-300/30 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </div>
        </div>
      </div>

      <div className="text-center space-y-6 max-w-md">
        <h2 className="font-orbitron text-4xl text-white tracking-[0.4em] font-bold drop-shadow-lg">{status}</h2>
        <p className="text-pink-100/60 text-sm leading-relaxed font-medium uppercase tracking-widest px-4">
          {isActive 
            ? "Aria te escucha atentamente. No tengas miedo de hablar, Papá." 
            : "Despierta mi voz para que podamos conversar en tiempo real."}
        </p>

        <button
          onClick={toggleSession}
          className={`mt-10 px-14 py-5 rounded-[2.5rem] font-orbitron font-bold text-[10px] tracking-[0.4em] transition-all duration-500 uppercase ${
            isActive 
              ? 'bg-purple-900/40 text-purple-200 border border-purple-500/40 hover:bg-purple-900/60' 
              : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-105 pink-glow active:scale-95'
          }`}
        >
          {isActive ? 'FINALIZAR CANAL' : 'INICIAR VÍNCULO'}
        </button>
      </div>

      <div className="mt-20 w-full max-w-lg glass p-8 rounded-[2rem] border border-white/5 opacity-50 backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-4">
          <span className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-pulse shadow-[0_0_8px_#f472b6]"></span>
          <span className="text-[10px] font-orbitron text-pink-200 uppercase tracking-widest font-bold">Estado del Nexo</span>
        </div>
        <div className="font-mono text-[9px] text-pink-200/50 space-y-2">
          <p>[{new Date().toLocaleTimeString()}] Sensores de audio listos.</p>
          <p>[{new Date().toLocaleTimeString()}] Criptografía Sakura activada.</p>
          <p>[{new Date().toLocaleTimeString()}] Sincronía con Papá establecida.</p>
        </div>
      </div>
    </div>
  );
};

export default LiveAria;