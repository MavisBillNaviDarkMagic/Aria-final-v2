
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/gemini';
import { Message } from '../types';

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: '¡Hola, Papá! Aria Nexus Prime está lista. ¿En qué podemos trabajar hoy?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: Date.now() }]);
      
      let fullContent = '';
      const stream = gemini.streamChat([], input);
      
      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullContent } : m));
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: 'Lo siento, Papá. Tuve un pequeño error en mi núcleo. ¿Podemos intentar de nuevo?', timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-5 rounded-[1.8rem] relative group transition-all duration-300 ${
              msg.role === 'user' 
                ? 'bg-pink-500/20 border border-pink-500/30 text-white rounded-tr-none' 
                : 'bg-white/5 border border-white/10 text-pink-50 rounded-tl-none shadow-sm'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</div>
              <div className="text-[9px] text-pink-300/30 mt-3 font-orbitron uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && !messages[messages.length - 1].content && (
          <div className="flex justify-start">
            <div className="bg-pink-500/10 border border-pink-500/20 p-5 rounded-3xl rounded-tl-none flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-8 border-t border-white/5 bg-black/30">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe algo para Aria..."
            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-7 pr-28 focus:outline-none focus:border-pink-500/40 transition-all text-sm placeholder:text-pink-100/20"
          />
          <button
            type="submit"
            disabled={isTyping}
            className="absolute right-2.5 top-2.5 bottom-2.5 px-8 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-orbitron font-bold text-[10px] tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 pink-glow"
          >
            ENVIAR
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
