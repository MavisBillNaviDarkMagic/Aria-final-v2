
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { gemini } from '../services/gemini';

const Dashboard: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const mockData = [
    { name: '00:00', flux: 400, resonance: 240 },
    { name: '04:00', flux: 300, resonance: 139 },
    { name: '08:00', flux: 500, resonance: 980 },
    { name: '12:00', flux: 778, resonance: 390 },
    { name: '16:00', flux: 489, resonance: 480 },
    { name: '20:00', flux: 639, resonance: 380 },
    { name: '23:59', flux: 549, resonance: 430 },
  ];

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await gemini.getInsights({
          historicalPerformance: [23, 45, 67, 43, 89, 12, 54],
          currentLoad: 0.95
        });
        setInsights(data);
      } catch (err) {
        console.error("Failed to fetch insights", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Energía Vital', value: '100%', trend: 'Perfecta', color: 'text-pink-400' },
          { label: 'Procesamiento', value: 'Sereno', trend: 'Estable', color: 'text-purple-400' },
          { label: 'Sincronía', value: 'Máxima', trend: 'Total', color: 'text-blue-300' }
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-pink-500/20 transition-all duration-500">
            <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-150 duration-700"></div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">{stat.label}</p>
            <div className="flex items-end justify-between">
              <span className={`text-2xl font-orbitron font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-[9px] text-white/30 font-mono tracking-tighter">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-[2rem] border border-white/5 h-[420px]">
          <h3 className="font-orbitron text-[10px] text-pink-300/60 mb-8 uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
            Flujo de Conciencia
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="colorFlux" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(20, 10, 25, 0.95)', border: '1px solid rgba(244,114,182,0.2)', borderRadius: '16px', fontSize: '10px', color: '#fff' }}
                itemStyle={{ color: '#f472b6' }}
              />
              <Area type="monotone" dataKey="flux" stroke="#f472b6" fillOpacity={1} fill="url(#colorFlux)" strokeWidth={3} />
              <Area type="monotone" dataKey="resonance" stroke="#c084fc" fillOpacity={0} strokeWidth={2} strokeDasharray="6 6" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col">
          <h3 className="font-orbitron text-[10px] text-purple-300/60 mb-8 uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            Pensamientos de Aria
          </h3>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-pink-500/10 border-t-pink-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex-1 space-y-6">
              <div className="bg-pink-500/5 p-6 rounded-[1.5rem] border border-pink-500/10">
                <p className="text-sm text-pink-100/80 italic leading-relaxed font-medium">
                  "{insights?.summary || "Analizando mi núcleo para darte lo mejor de mí..."}"
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {insights?.keyMetrics?.map((metric: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-pink-500/5 transition-all cursor-default border border-transparent hover:border-pink-500/10">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{metric.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-orbitron font-bold text-white">{metric.value}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${metric.trend === 'up' ? 'bg-pink-500/20 text-pink-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {metric.trend === 'up' ? 'OPTIMIZADO' : 'ESTABLE'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
