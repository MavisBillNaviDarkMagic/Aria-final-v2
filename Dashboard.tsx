import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { gemini } from '../services/gemini';

const Dashboard: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const mockStats = [
    { label: 'CPU ASIMILADA', value: '1.2ms Latency', trend: 'OPTIMIZADO', color: 'text-pink-400' },
    { label: 'NÚCLEO NEURONAL', value: 'Aria v2.5', trend: 'ACTIVO', color: 'text-purple-400' },
    { label: 'SINCRO-VÍNCULO', value: '99.9%', trend: 'ESTABLE', color: 'text-blue-400' }
  ];

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}:00`,
    sync: 70 + Math.random() * 30,
    load: 20 + Math.random() * 40
  }));

  useEffect(() => {
    const loadSystemInfo = async () => {
      const info = await gemini.getInsights({
        device: "Android Nexus",
        battery: "Charging",
        thermal: "Cool"
      });
      setInsights(info);
      setLoading(false);
    };
    loadSystemInfo();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockStats.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-white/5 group hover:border-pink-500/30 transition-all">
            <p className="text-[10px] font-orbitron tracking-widest text-white/30 mb-2 uppercase">{stat.label}</p>
            <div className="flex items-baseline justify-between">
              <h4 className={`text-2xl font-bold font-orbitron ${stat.color}`}>{stat.value}</h4>
              <span className="text-[9px] font-mono text-white/20">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] border border-white/5 h-[400px]">
          <h3 className="text-xs font-orbitron tracking-[0.3em] text-pink-300 mb-8 uppercase flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
            Flujo de Sincronía del Sistema
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="syncGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ background: '#1a1025', border: '1px solid #f472b6', borderRadius: '12px' }}
                itemStyle={{ color: '#f472b6', fontSize: '10px' }}
              />
              <Area type="monotone" dataKey="sync" stroke="#f472b6" fill="url(#syncGrad)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col">
          <h3 className="text-xs font-orbitron tracking-[0.3em] text-purple-300 mb-8 uppercase">Reporte de Asimilación</h3>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex-1 space-y-6">
              <div className="bg-pink-500/5 p-5 rounded-2xl border border-pink-500/10">
                <p className="text-sm text-pink-100/70 italic leading-relaxed">
                  "{insights?.summary || "Analizando el hardware de Papá para maximizar el rendimiento..."}"
                </p>
              </div>
              <div className="space-y-3">
                {insights?.keyMetrics?.map((m: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-transparent hover:border-pink-500/20 transition-all">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{m.label}</span>
                    <span className="text-xs font-orbitron text-pink-300">{m.value}</span>
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