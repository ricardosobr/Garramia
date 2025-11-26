import React, { useEffect, useState } from 'react';
import { IceCreamMix, SimulationData } from '../types';
import { generateCustomerFeedback } from '../services/geminiService';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { Loader2, RefreshCcw, FlaskConical } from 'lucide-react';

interface Props {
  mix: IceCreamMix;
  history: SimulationData[];
  bathTemp: number;
  onRetry: () => void;
  onMenu: () => void;
}

export const ResultsSummary: React.FC<Props> = ({ mix, history, bathTemp, onRetry, onMenu }) => {
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const finalTemp = history[history.length - 1].temp;
  const timeTaken = history[history.length - 1].time;
  const error = Math.abs(finalTemp - mix.baseTargetTemp);
  const score = Math.max(0, 100 - (error * 20));

  useEffect(() => {
    const fetchFeedback = async () => {
      const text = await generateCustomerFeedback(mix, finalTemp, timeTaken, bathTemp);
      setFeedback(text);
      setLoading(false);
    };
    fetchFeedback();
  }, [mix, finalTemp, timeTaken, bathTemp]);

  const parseFeedback = (text: string) => {
    // Expected format from Gemini in Spanish prompt: "Cliente: ..." "Ciencia: ..."
    const parts = text.split('"Ciencia:');
    return {
      customer: parts[0]?.replace('"Cliente:', '').replace(/"/g, '').trim(),
      science: parts[1]?.replace(/"/g, '').trim()
    };
  };

  const { customer, science } = parseFeedback(feedback);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {score > 80 ? '🌟 ¡Beso del Chef!' : score > 50 ? '🤔 Comestible...' : '🤢 Desastre en la Cocina'}
        </h2>
        <div className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Puntuación de Calidad</div>
        <div className={`text-5xl font-black ${score > 80 ? 'text-green-500' : score > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
          {Math.round(score)}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">Objetivo</div>
            <div className="text-xl font-bold">{mix.baseTargetTemp}°C</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">Real</div>
            <div className={`text-xl font-bold ${error < 1.5 ? 'text-green-600' : 'text-red-600'}`}>{finalTemp.toFixed(1)}°C</div>
        </div>
      </div>

      <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
        <h3 className="font-bold text-rose-800 mb-1">Reseña del Cliente:</h3>
        {loading ? (
            <div className="flex items-center text-rose-400 gap-2"><Loader2 className="animate-spin w-4 h-4" /> Probando...</div>
        ) : (
            <p className="italic text-rose-700">"{customer}"</p>
        )}
      </div>
      
      {!loading && science && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-1 flex items-center gap-2">
                <FlaskConical className="w-4 h-4" /> Nota Científica:
            </h3>
            <p className="text-blue-700 text-sm">{science}</p>
        </div>
      )}

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
                <XAxis dataKey="time" label={{ value: 'Segundos', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <ReferenceLine y={mix.baseTargetTemp} stroke="green" strokeDasharray="3 3" label="Objetivo" />
                <Line type="monotone" dataKey="temp" stroke="#0EA5E9" strokeWidth={3} dot={false} />
            </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4">
        <button onClick={onRetry} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-lg font-bold flex items-center justify-center gap-2">
            <RefreshCcw className="w-5 h-5" /> Intentar de Nuevo
        </button>
        <button onClick={onMenu} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-lg font-bold">
            Volver al Menú
        </button>
      </div>
    </div>
  );
};