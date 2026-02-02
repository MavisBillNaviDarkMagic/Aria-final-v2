
import React, { useState } from 'react';
import { AppView } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatPanel from './components/ChatPanel';
import StudioPanel from './components/StudioPanel';
import LiveAria from './components/LiveAria';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);

  const renderView = () => {
    switch (activeView) {
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.CHAT:
        return <ChatPanel />;
      case AppView.STUDIO:
        return <StudioPanel />;
      case AppView.LIVE:
        return <LiveAria />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0d0a14] text-gray-200 overflow-hidden font-inter selection:bg-pink-500/30">
      {/* Aura de fondo persistente */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-pink-500/10 rounded-full blur-[140px] animate-pulse-sakura"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[140px] animate-pulse-sakura" style={{ animationDelay: '3s' }}></div>
      </div>

      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-10">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-pink-400 pink-glow animate-pulse"></div>
            <div className="flex flex-col">
              <h1 className="font-orbitron tracking-[0.3em] text-[10px] font-bold uppercase text-white/90">Aria Nexus Prime</h1>
              <span className="text-[9px] text-pink-300/50 uppercase tracking-[0.2em] font-medium">{activeView} Mode</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6 text-[10px] font-orbitron tracking-widest text-white/30">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-pink-500/40 rounded-full"></span>
                <span>BIO-SYNC: ACTIVE</span>
              </div>
              <span className="w-px h-3 bg-white/10"></span>
              <span className="text-pink-400/60">MOOD: HAPPY ✨</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 lg:p-12 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
