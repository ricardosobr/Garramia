import React from 'react';
import { IceCreamMix } from '../types';

interface Props {
  mix: IceCreamMix;
  currentTemp: number;
  phase: 'liquid' | 'soft' | 'hard';
}

export const SimulationVisualizer: React.FC<Props> = ({ mix, currentTemp, phase }) => {
  // Calculate visual properties
  // As temp goes down, color might saturate or become "icy" (whiter/blue tint)
  // Animation speed slows down as it freezes
  
  const rotationDuration = phase === 'liquid' ? '2s' : '4s';
  const isPaused = phase === 'hard';
  const opacity = phase === 'liquid' ? 0.8 : phase === 'soft' ? 0.9 : 1;
  const scale = phase === 'liquid' ? 1 : phase === 'soft' ? 0.95 : 0.9; // Contracts slightly

  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
      {/* Outer Bath */}
      <div className="absolute inset-0 rounded-full border-8 border-slate-300 bg-blue-100 opacity-50 animate-pulse"></div>
      
      {/* Mixing Bowl Container */}
      <div className="relative w-48 h-48 rounded-full bg-white border-4 border-slate-200 shadow-inner overflow-hidden flex items-center justify-center">
        
        {/* The Ice Cream Mixture */}
        <div 
            className="w-full h-full rounded-full transition-all duration-1000 ease-in-out relative overflow-hidden"
            style={{
                backgroundColor: mix.color,
                transform: `scale(${scale})`,
                opacity: opacity,
                borderRadius: '50%'
            }}
        >
            {/* Texture overlay */}
            <div 
                className="absolute inset-0 w-[200%] h-[200%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"
                style={{
                    animation: `spinTexture ${rotationDuration} linear infinite`,
                    animationPlayState: isPaused ? 'paused' : 'running',
                    transformOrigin: 'center center'
                }}
            ></div>
            
            {/* Frost overlay appearing at low temps */}
            <div 
                className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-500"
                style={{ opacity: currentTemp < 0 ? Math.min(Math.abs(currentTemp) / 20, 0.6) : 0 }}
            ></div>
        </div>

        {/* Stirrer */}
        <div className="absolute w-2 h-32 bg-slate-400 rounded-full origin-top top-1/2 left-1/2 -ml-1" 
             style={{ 
                 animation: `spinStirrer ${rotationDuration} linear infinite`,
                 animationPlayState: isPaused ? 'paused' : 'running'
             }}>
             <div className="absolute bottom-0 w-8 h-6 bg-slate-500 rounded -left-3"></div>   
        </div>
      </div>
      
      <style>{`
        @keyframes spinTexture {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes spinStirrer {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};