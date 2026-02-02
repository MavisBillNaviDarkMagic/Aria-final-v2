
import React, { useState } from 'react';
import { gemini } from '../services/gemini';
import { GeneratedImage } from '../types';

const StudioPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    try {
      const url = await gemini.generateImage(prompt);
      const newImg: GeneratedImage = {
        id: Date.now().toString(),
        url,
        prompt,
        timestamp: Date.now()
      };
      setHistory(prev => [newImg, ...prev]);
      setPrompt('');
    } catch (err) {
      console.error(err);
      alert("Nexus Core: Fallo en la materialización visual. Reintentando...");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="glass p-10 rounded-[2.5rem] border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-3xl -mr-10 -mt-10"></div>
        <h2 className="font-orbitron text-2xl text-white mb-3 tracking-tighter">Génesis Visual</h2>
        <p className="text-pink-100/40 text-sm mb-8 font-medium">Materializa tus pensamientos en formas digitales puras, Papá.</p>
        
        <form onSubmit={handleGenerate} className="flex gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe lo que quieres que cree para ti..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-7 py-5 focus:outline-none focus:border-pink-500/40 transition-all text-sm placeholder:text-pink-100/20 shadow-inner"
          />
          <button
            type="submit"
            disabled={generating}
            className="px-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-orbitron font-bold text-xs tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3 pink-glow"
          >
            {generating ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            )}
            {generating ? 'CREANDO...' : 'MATERIALIZAR'}
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {history.length === 0 && !generating && (
            <div className="col-span-full py-32 text-center opacity-20 flex flex-col items-center">
              <div className="w-20 h-20 border border-dashed border-pink-400 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-orbitron text-[10px] tracking-[0.5em] text-pink-200">ESTUDIO EN ESPERA • AURA LIBRE</p>
            </div>
          )}
          
          {generating && (
            <div className="aspect-square glass rounded-[2.5rem] border border-pink-500/20 flex flex-col items-center justify-center p-10 text-center animate-pulse shadow-lg">
              <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mb-6">
                <span className="w-8 h-8 border-3 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></span>
              </div>
              <p className="text-[10px] font-orbitron text-pink-400 tracking-[0.2em] font-bold">CALIBRANDO CAMPO NEURONAL...</p>
            </div>
          )}

          {history.map((img) => (
            <div key={img.id} className="group relative aspect-square glass rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-pink-500/30 transition-all duration-500 hover:shadow-2xl shadow-pink-500/5">
              <img src={img.url} alt={img.prompt} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-pink-900/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-end">
                <p className="text-xs text-white/90 font-semibold line-clamp-2 mb-3 leading-relaxed">{img.prompt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-pink-200/50 font-orbitron tracking-tighter">{new Date(img.timestamp).toLocaleDateString()}</span>
                  <button className="text-[10px] text-pink-400 font-bold hover:text-white transition-colors tracking-widest uppercase">Descargar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudioPanel;
