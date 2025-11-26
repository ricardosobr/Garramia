import React, { useState } from 'react';
import { GameState } from './types';
import { GameMode } from './components/GameMode';
import { LabMode } from './components/LabMode';
import { Tutorial } from './components/Tutorial';
import { Snowflake, FlaskConical, Play } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<GameState>(GameState.MENU);

  return (
    <div className="min-h-screen bg-cream-50 font-sans text-slate-800">
      
      {/* Main Menu */}
      {view === GameState.MENU && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in duration-700">
          <div className="mb-8 p-6 bg-white rounded-full shadow-2xl shadow-cream-200">
            <Snowflake className="w-16 h-16 text-blue-400 animate-spin-slow" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-2 tracking-tight">Garramica</h1>
          <p className="text-xl text-slate-500 mb-12 font-medium">Arcade de Helados Artesanales</p>

          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button 
                onClick={() => setView(GameState.TUTORIAL)}
                className="group relative flex items-center justify-center gap-3 bg-slate-900 text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
                <Play className="fill-current w-5 h-5" /> Iniciar Juego
            </button>
            
            <button 
                onClick={() => setView(GameState.LAB)}
                className="flex items-center justify-center gap-3 bg-white text-slate-700 border-2 border-slate-200 py-4 px-8 rounded-xl font-bold text-lg hover:border-purple-400 hover:text-purple-600 transition-all hover:bg-purple-50"
            >
                <FlaskConical className="w-5 h-5" /> Modo Laboratorio
            </button>
          </div>

          <div className="mt-16 text-xs text-slate-400 max-w-md text-center">
            Aprende <span className="font-mono">Q = mcΔT</span> sirviendo pedidos. 
            <br/>Controla la temperatura del baño para lograr la textura perfecta.
          </div>
        </div>
      )}

      {/* Tutorial View */}
      {view === GameState.TUTORIAL && (
        <Tutorial 
            onComplete={() => setView(GameState.GAME_DIFFICULTY)} 
            onBack={() => setView(GameState.MENU)}
        />
      )}

      {/* Game View */}
      {(view === GameState.GAME_DIFFICULTY || 
        view === GameState.GAME_LOOP || 
        view === GameState.GAME_OVER) && (
        <div className="min-h-screen p-4 flex flex-col">
            <GameMode onBack={() => setView(GameState.MENU)} />
        </div>
      )}

      {/* Lab View */}
      {view === GameState.LAB && (
        <div className="min-h-screen p-4 flex flex-col">
            <LabMode onBack={() => setView(GameState.MENU)} />
        </div>
      )}

      <style>{`
        .animate-spin-slow {
            animation: spin 10s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}