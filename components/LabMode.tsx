import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { calculateNextStep } from '../services/physics.ts';
import { INITIAL_ROOM_TEMP } from '../constants';
import { FlaskConical, Scale, Zap, ThermometerSnowflake, BookOpen, ArrowRight, ArrowLeft, Flame, Snowflake } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const CONCEPTS = [
  {
    id: 'flow',
    title: "0. Flujo de Calor (Q)",
    icon: ArrowRight, // Placeholder, we replace this with custom anim
    color: "text-rose-600",
    bg: "bg-rose-100",
    desc: "El calor es energía en movimiento buscando equilibrio.",
    insight: "La regla de oro del universo: La energía SIEMPRE viaja de lo CALIENTE a lo FRÍO. Imagina que el calor es agua bajando por una cascada; no puede subir sola. En nuestro caso, el calor 'salta' de la mezcla al baño de hielo."
  },
  {
    id: 'mass',
    title: "1. Masa (m)",
    icon: Scale,
    color: "text-purple-600",
    bg: "bg-purple-100",
    desc: "La cantidad de materia en tu mezcla.",
    insight: "Imagina enfriar una taza de café vs. una bañera llena. Cuanta más masa tengas, más 'inercia térmica' existe. Tardará más tiempo en cambiar de temperatura porque hay más moléculas que necesitan perder energía."
  },
  {
    id: 'sh',
    title: "2. Calor Específico (c)",
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-100",
    desc: "La 'terquedad' de un material ante el cambio.",
    insight: "El agua es muy terca (c=4.18), retiene mucho el calor. La crema y el azúcar (c≈1.5-3.0) cambian de temperatura más fácil. Por eso un sorbete (mucha agua) tarda más en congelar que un helado cremoso."
  },
  {
    id: 'dt',
    title: "3. Diferencia de Temp (ΔT)",
    icon: ThermometerSnowflake,
    color: "text-blue-600",
    bg: "bg-blue-100",
    desc: "El motor que impulsa la velocidad del cambio.",
    insight: "Según la Ley de Enfriamiento de Newton, el calor fluye más rápido cuando la diferencia es grande. Un baño a -40°C robará calor violentamente al principio, pero el proceso se frenará a medida que las temperaturas se acerquen."
  }
];

export const LabMode: React.FC<Props> = ({ onBack }) => {
  const [showTheory, setShowTheory] = useState(true);
  
  // Simulation State
  const [mass, setMass] = useState(200);
  const [specificHeat, setSpecificHeat] = useState(3.5);
  const [bathTemp, setBathTemp] = useState(-15);
  const [data, setData] = useState<{time: number, temp: number}[]>([]);

  // Re-calculate the curve whenever inputs change
  useEffect(() => {
    const newData = [];
    let temp = INITIAL_ROOM_TEMP;
    // Simulate 60 seconds
    for(let t = 0; t <= 60; t += 1) {
        newData.push({ time: t, temp: temp });
        // Calculate 1 second worth of cooling
        // We use a smaller internal step for accuracy even in preview
        for(let i=0; i<10; i++) {
             temp = calculateNextStep(temp, bathTemp, mass, specificHeat, 0.1);
        }
    }
    setData(newData);
  }, [mass, specificHeat, bathTemp]);

  if (showTheory) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
             <ArrowLeft className="w-6 h-6" />
           </button>
           <div>
             <h2 className="text-3xl font-black text-slate-800">Fundamentos Teóricos</h2>
             <p className="text-slate-500">Entiende las variables antes de experimentar.</p>
           </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {CONCEPTS.map((c, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-4">
                  
                  {/* Icon or Custom Animation */}
                  <div className={`w-16 h-16 ${c.bg} ${c.color} rounded-2xl flex items-center justify-center shrink-0`}>
                    {c.id === 'flow' ? (
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
                            {/* Hot Side */}
                            <div className="absolute left-2 text-rose-500 opacity-80"><Flame size={16} fill="currentColor" /></div>
                            
                            {/* Cold Side */}
                            <div className="absolute right-2 text-blue-500 opacity-80"><Snowflake size={16} fill="currentColor" /></div>
                            
                            {/* Moving Particles */}
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-rose-500 rounded-full animate-heat-flow" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-rose-500 rounded-full animate-heat-flow" style={{ animationDelay: '0.3s' }}></div>
                                <div className="w-2 h-2 bg-rose-400 rounded-full animate-heat-flow" style={{ animationDelay: '0.6s' }}></div>
                            </div>
                        </div>
                    ) : (
                        <c.icon className="w-8 h-8" />
                    )}
                  </div>

                  <div className="ml-4 flex-1">
                     <h3 className="text-xl font-bold text-slate-800">{c.title}</h3>
                     <p className="font-semibold text-slate-600 text-sm mt-1 leading-snug">{c.desc}</p>
                  </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 border-l-4 border-slate-300 mt-auto">
                <span className="font-bold text-slate-400 text-xs uppercase tracking-wider block mb-1">Insight</span>
                "{c.insight}"
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button 
            onClick={() => setShowTheory(false)}
            className="group bg-slate-900 text-white py-4 px-10 rounded-xl font-bold text-xl hover:bg-slate-800 transition-all hover:scale-105 shadow-xl flex items-center gap-3"
          >
            Ir al Laboratorio <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <style>{`
            @keyframes heat-flow {
                0% { transform: translateX(-10px); opacity: 0; scale: 0.5; }
                20% { opacity: 1; scale: 1; }
                80% { opacity: 1; scale: 1; background-color: #f43f5e; } /* Rose-500 */
                100% { transform: translateX(10px); opacity: 0; scale: 0.5; background-color: #3b82f6; } /* Blue-500 */
            }
            .animate-heat-flow {
                animation: heat-flow 1.5s infinite linear;
            }
        `}</style>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)] animate-in fade-in duration-500">
      
      {/* Controls Sidebar */}
      <div className="w-full md:w-1/3 bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-6 overflow-y-auto">
        <div className="flex items-center justify-between text-slate-800 mb-2">
             <div className="flex items-center gap-2">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full -ml-2 text-slate-400">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <FlaskConical className="text-purple-600" />
                  <h2 className="text-xl font-bold">Laboratorio</h2>
                </div>
             </div>
             <button 
                onClick={() => setShowTheory(true)}
                className="text-xs font-bold text-slate-400 hover:text-purple-600 flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-full hover:bg-purple-50 transition-colors"
             >
                <BookOpen className="w-3 h-3" /> Conceptos
             </button>
        </div>
        
        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors hover:border-purple-200">
            <div className="flex items-center gap-2 mb-1">
                <Scale className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-700">1. Masa (m)</h3>
            </div>
            <input 
                type="range" min="50" max="500" value={mass} 
                onChange={(e) => setMass(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="text-right font-mono text-purple-700 font-bold">{mass}g</div>
            <p className="text-xs text-slate-500">Más materia = Más inercia térmica.</p>
        </div>

        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors hover:border-amber-200">
            <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-700">2. Calor Específico (c)</h3>
            </div>
            <input 
                type="range" min="1.0" max="4.2" step="0.1" value={specificHeat} 
                onChange={(e) => setSpecificHeat(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="text-right font-mono text-amber-700 font-bold">{specificHeat} J/g°C</div>
            <p className="text-xs text-slate-500">
                Resistencia al cambio de temperatura. <br/>(Agua = Alto, Grasa = Bajo).
            </p>
        </div>

        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors hover:border-blue-200">
             <div className="flex items-center gap-2 mb-1">
                <ThermometerSnowflake className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-700">3. Temp del Baño (T_env)</h3>
            </div>
            <input 
                type="range" min="-40" max="-5" step="1" value={bathTemp} 
                onChange={(e) => setBathTemp(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="text-right font-mono text-blue-700 font-bold">{bathTemp}°C</div>
            <p className="text-xs text-slate-500">Fuerza impulsora del enfriamiento (ΔT).</p>
        </div>
      </div>

      {/* Graph Area */}
      <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg flex flex-col border border-slate-100">
        <h3 className="text-lg font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center justify-between">
            <span>Simulación en Tiempo Real</span>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 normal-case tracking-normal">Modelo Newtoniano</span>
        </h3>
        <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                    <XAxis 
                        dataKey="time" 
                        label={{ value: 'Tiempo (s)', position: 'insideBottomRight', offset: -10, fill: '#94a3b8' }} 
                        stroke="#cbd5e1"
                        tick={{fill: '#64748b'}}
                    />
                    <YAxis 
                        domain={[bathTemp - 5, 25]} 
                        label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} 
                        stroke="#cbd5e1"
                        tick={{fill: '#64748b'}}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)' 
                        }} 
                    />
                    <Line 
                        type="monotone" 
                        dataKey="temp" 
                        stroke="#8B5CF6" 
                        strokeWidth={4} 
                        dot={false}
                        animationDuration={500}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl text-slate-700 text-sm border border-purple-100 shadow-sm">
            <strong className="text-purple-700 block mb-1">🔭 Observación:</strong> 
            Observa cómo la curva es empinada al principio (cuando ΔT es grande) y se aplana al final. 
            Modifica <strong>c</strong> para ver cómo cambia la curvatura sin cambiar las temperaturas inicial/final.
        </div>
      </div>
    </div>
  );
};