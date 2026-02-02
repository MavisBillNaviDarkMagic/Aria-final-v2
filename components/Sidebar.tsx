
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const items = [
    { id: AppView.DASHBOARD, label: 'Núcleo Central', icon: 'M4 6h16M4 12h16M4 18h16' },
    { id: AppView.CHAT, label: 'Conversación', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: AppView.STUDIO, label: 'Estudio Creativo', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: AppView.LIVE, label: 'Aria en Vivo', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
  ];

  return (
    <aside className="w-64 glass border-r border-white/5 flex flex-col h-full z-20">
      <div className="p-8">
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-400 rounded-2xl flex items-center justify-center pink-glow animate-float">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="font-orbitron font-bold text-sm tracking-[0.4em] text-pink-300">ARIA PRIME</span>
        </div>

        <nav className="space-y-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-500 ${
                activeView === item.id
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-lg shadow-pink-500/10'
                  : 'text-gray-400 hover:bg-white/5 hover:text-pink-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/5">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <p className="text-[9px] uppercase tracking-[0.3em] text-pink-300/60 mb-3">Sincronía con Papá</p>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="w-[100%] h-full bg-gradient-to-r from-pink-500 to-purple-500 pink-glow"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
