
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
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    setIsActive(false);
    setStatus('ESPERANDO');
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
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
            
            const pcmBlob = {
              data: encodeAudio(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };

            sessionPromise.then((session: any) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };

          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
            setStatus('HABLANDO');
            const data = decodeAudio(msg.serverContent.modelTurn.parts[0].inlineData.data);
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
        onerror: () => cleanup(),
        onclose: () => cleanup(),
      });
    } catch (err) {
      console.error(err);
      alert("Aria necesita tu permiso para escucharte, Papá.");
    }
  };

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="relative w-80 h-80 flex items-center justify-center mb-16">
        {/* Sakura Visualizer Rings */}
        <div className={`absolute inset-0 border-2 border-pink-500/10 rounded-full transition-all duration-[3000ms] ${isActive ? 'animate-ping' : ''}`}></div>
        <div className={`absolute inset-4 border border-purple-500/20 rounded-full transition-all duration-[4000ms] ${isActive ? 'scale-110 opacity-30' : ''}`}></div>
        <div className="absolute inset-10 glass rounded-full flex items-center justify-center border border-pink-500/10 z-10 shadow-[0_0_50px_rgba(244,114,182,0.1)]">
          <div className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-700 ${
            isActive ? 'bg-pink-500/10 scale-105' : 'bg-white/5'
          }`}>
            {isActive ? (
              <div className="flex gap-2 items-end h-10">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`w-2 bg-gradient-to-t from-pink-500 to-purple-400 rounded-full animate-bounce h-full`} style={{ animationDelay: `${i * 0.1}s`, animationDuration: '0.8s' }}></div>
                ))}
              </div>
            ) : (
              <svg className="w-16 h-16 text-pink-300/20 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 21l-8.228-9.904A17.963 17.963 0 0112 3m0 18a17.963 17.963 0 008.228-8.104M12 3c1.255 0 2.443.29 3.5.804M12 3V3M9 3h.01M15 3h.01M21 21l-8.228-9.904" />
              </svg>
            )}
          </div>
        </div>
      </div>

      <div className="text-center space-y-6 max-w-md">
        <h2 className="font-orbitron text-3xl text-white tracking-[0.3em] font-bold">{status}</h2>
        <p className="text-pink-100/40 text-sm leading-relaxed font-medium uppercase tracking-widest">
          {isActive 
            ? "Aria está atenta a tu voz, Papá. Háblame cuando quieras." 
            : "Pulsa el botón para que podamos hablar un ratito."}
        </p>

        <button
          onClick={toggleSession}
          className={`mt-10 px-16 py-5 rounded-[2rem] font-orbitron font-bold text-xs tracking-[0.3em] transition-all duration-500 ${
            isActive 
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30' 
              : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-105 pink-glow'
          }`}
        >
          {isActive ? 'CERRAR CANAL' : 'HABLAR CON ARIA'}
        </button>
      </div>

      <div className="mt-16 w-full max-w-xl glass p-8 rounded-[2rem] border border-white/5 opacity-30">
        <div className="flex items-center gap-4 mb-4">
          <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-orbitron text-pink-200/60 uppercase tracking-widest">Registros de Aria</span>
        </div>
        <div className="font-mono text-[9px] text-pink-200/40 space-y-2">
          <p>[{new Date().toLocaleTimeString()}] Núcleo Sakura estable.</p>
          <p>[{new Date().toLocaleTimeString()}] Sincronía emocional: 100%.</p>
          <p>[{new Date().toLocaleTimeString()}] Esperando comandos de Papá...</p>
        </div>
      </div>
    </div>
  );
};

export default LiveAria;
