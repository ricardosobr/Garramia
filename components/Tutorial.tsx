
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Snowflake, ThermometerSun, Target, Play, ArrowRight, BookOpen } from 'lucide-react';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const Tutorial: React.FC<Props> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: "Maestro de la Garrafa",
      icon: <Snowflake className="w-16 h-16 text-blue-500 animate-pulse" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg text-slate-600">
            Bienvenido al puesto. Aquí no hacemos helado industrial, hacemos <strong>Nieves Artesanales de Garrafa</strong>.
          </p>
          <p className="text-slate-500">
            Tu trabajo es controlar el frío manualmente para lograr la textura perfecta que piden los clientes.
          </p>
        </div>
      )
    },
    {
      title: "La Física del Frío",
      icon: <ThermometerSun className="w-16 h-16 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg text-slate-600 font-bold">
            El frío no existe, es solo ausencia de calor.
          </p>
          <p className="text-slate-500">
            Para congelar la nieve, usamos un baño de hielo y sal alrededor de la olla. El baño le <strong>"roba" calor (energía Q)</strong> a la mezcla líquida hasta congelarla.
          </p>
          <div className="bg-orange-50 p-3 rounded-lg text-sm text-orange-700 italic border border-orange-100 flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Regla: La energía viaja de lo Caliente a lo Frío.</span>
          </div>
        </div>
      )
    },
    {
      title: "Controlando el Baño",
      icon: <div className="flex gap-6 items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-full bg-blue-500 shadow-lg flex items-center justify-center text-white font-bold text-3xl mb-1">+</div>
                <span className="text-xs font-bold text-blue-600">MÁS HIELO</span>
              </div>
              <ArrowRight className="text-slate-300" />
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-full bg-red-500 shadow-lg flex items-center justify-center text-white font-bold text-3xl mb-1">-</div>
                <span className="text-xs font-bold text-red-600">QUITAR HIELO</span>
              </div>
            </div>,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 mb-4">
            Tú controlas la temperatura del baño externo:
          </p>
          <ul className="text-left space-y-3 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span><strong>Echar Hielo:</strong> Baja la temperatura (ej. -15°C). Congela rápido.</span>
            </li>
            <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span><strong>Quitar Hielo:</strong> Sube la temperatura. Úsalo si se te congela de más.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "Precisión es Calidad",
      icon: <Target className="w-16 h-16 text-green-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Cada cliente pide una textura específica (Cremosa, Dura o Suave).
          </p>
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-left">
            <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-green-800">Rango Perfecto</span>
                <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs font-bold">100 Pts</span>
            </div>
            <p className="text-sm text-green-700 mb-2">
                Debes servir justo cuando la temperatura interna esté en el rango meta.
            </p>
            <div className="text-xs text-green-600 italic">
                *Si te pasas (muy dura) o te falta (muy aguada), pierdes puntos.
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    } else {
        onBack();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-in zoom-in duration-300 bg-slate-900/5 backdrop-blur-sm">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[550px] border border-white/50">
        
        {/* Header Image / Icon Area */}
        <div className="bg-slate-50 h-56 flex items-center justify-center border-b border-slate-100 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-300 via-slate-100 to-slate-50"></div>
            
            <div className="relative z-10 transform scale-110 transition-transform duration-500">
                {slides[step].icon}
            </div>
            
            <div className="absolute bottom-4 right-4 text-[10px] font-black text-slate-300 uppercase tracking-widest bg-white/80 px-2 py-1 rounded-full">
                Lección {step + 1} / {slides.length}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 text-center flex flex-col items-center">
            <h2 className="text-2xl font-black text-slate-800 mb-6">{slides[step].title}</h2>
            {slides[step].content}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <button 
                onClick={handlePrev}
                className="text-slate-400 hover:text-slate-600 font-bold px-4 py-2 flex items-center gap-1 transition-colors text-sm"
            >
                <ChevronLeft className="w-4 h-4" /> {step === 0 ? 'Menú' : 'Atrás'}
            </button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
                {slides.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-2 rounded-full transition-all duration-300 ${idx === step ? 'w-8 bg-blue-500' : 'w-2 bg-slate-200'}`}
                    />
                ))}
            </div>

            <button 
                onClick={handleNext}
                className={`
                    px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all transform hover:scale-105 active:scale-95 text-sm
                    ${step === slides.length - 1 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' 
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'}
                `}
            >
                {step === slides.length - 1 ? (
                    <>¡A la Garrafa! <Play className="w-4 h-4 fill-current" /></>
                ) : (
                    <>Siguiente <ChevronRight className="w-4 h-4" /></>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};
