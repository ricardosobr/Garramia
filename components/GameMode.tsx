import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Difficulty, ActiveOrder, ServingSize, TexturePreference } from '../types';
import { AVAILABLE_MIXES, CUSTOMER_NAMES, SIZE_MASS_MAP, TEXTURE_TEMP_OFFSETS, INITIAL_ROOM_TEMP } from '../constants';
import { INGREDIENTS } from '../constants';
import { calculateNextStep } from '../services/physics';
import { SimulationVisualizer } from './SimulationVisualizer';
import { Plus, Minus, ThermometerSnowflake, CheckCircle, Snowflake, Timer, Star, RotateCcw, Home, Pause, Play, LogOut } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const GAME_DURATION = 90; // seconds

export const GameMode: React.FC<Props> = ({ onBack }) => {
  // Game Flow State
  const [phase, setPhase] = useState<GameState>(GameState.GAME_DIFFICULTY);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPaused, setIsPaused] = useState(false);
  
  // Gameplay State
  const [availableOrders, setAvailableOrders] = useState<ActiveOrder[]>([]);
  const [currentOrder, setCurrentOrder] = useState<ActiveOrder | null>(null);
  const [completedOrders, setCompletedOrders] = useState<{order: ActiveOrder, score: number}[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ emoji: string; text: string; color: string } | null>(null);
  
  // Physics State
  const [bathTemp, setBathTemp] = useState(-5); // Starts mild
  const [internalTemp, setInternalTemp] = useState(INITIAL_ROOM_TEMP);
  
  // Refs
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number | undefined>(undefined);

  // --- ORDER GENERATION ---
  const generateOrder = useCallback(() => {
    const mix = AVAILABLE_MIXES[Math.floor(Math.random() * AVAILABLE_MIXES.length)];
    const sizeKeys = Object.values(ServingSize);
    const size = sizeKeys[Math.floor(Math.random() * sizeKeys.length)];
    const prefKeys = Object.values(TexturePreference);
    const pref = prefKeys[Math.floor(Math.random() * prefKeys.length)];
    const name = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];

    // Calculate Physics Props
    let totalMass = SIZE_MASS_MAP[size];
    let totalHeatCapacity = 0;
    
    // Calculate weighted specific heat
    let baseMass = 0;
    mix.ingredients.forEach(ing => baseMass += ing.amount);
    
    mix.ingredients.forEach(ing => {
        const fraction = ing.amount / baseMass;
        const actualAmount = fraction * totalMass;
        const ingData = INGREDIENTS[ing.type];
        totalHeatCapacity += (actualAmount * ingData.specificHeat);
    });
    
    const avgSpecificHeat = totalHeatCapacity / totalMass;

    // Calculate Target Temp Range
    let targetRange: [number, number];
    if (pref === TexturePreference.HARD) {
         targetRange = [-20, -12];
    } else {
         const offsets = TEXTURE_TEMP_OFFSETS[pref];
         targetRange = [
            mix.baseTargetTemp + offsets[0], 
            mix.baseTargetTemp + offsets[1]
        ];
    }

    const newOrder: ActiveOrder = {
        id: Math.random().toString(36).substr(2, 9),
        customerName: name,
        mixId: mix.id,
        size,
        preference: pref,
        targetTempRange: targetRange,
        mass: totalMass,
        totalHeatCapacity: avgSpecificHeat,
        startTime: Date.now()
    };

    setAvailableOrders(prev => [...prev, newOrder].slice(-5)); // Keep max 5 orders
  }, []);

  // --- GAME LOOP & TIMER ---
  useEffect(() => {
    if (phase === GameState.GAME_LOOP && !isPaused) {
        // Initial Orders
        if (availableOrders.length === 0) {
            generateOrder();
            generateOrder();
            generateOrder();
        }

        // Timer
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setPhase(GameState.GAME_OVER);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Periodic new orders
        const orderInterval = setInterval(() => {
            if (availableOrders.length < 5) generateOrder();
        }, 4000);

        return () => {
            clearInterval(timer);
            clearInterval(orderInterval);
        };
    }
  }, [phase, isPaused, availableOrders.length, generateOrder]);


  // --- PHYSICS ENGINE ---
  const updatePhysics = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined && currentOrder && phase === GameState.GAME_LOOP && !isPaused) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      
      // Calculate cooling
      setInternalTemp(prev => {
          // Speed up simulation time 5x for gameplay fun
          return calculateNextStep(prev, bathTemp, currentOrder.mass, currentOrder.totalHeatCapacity, deltaTime * 5);
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(updatePhysics);
  }, [bathTemp, currentOrder, phase, isPaused]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updatePhysics]);


  // --- CONTROLS ---
  const handleStartGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setTimeLeft(GAME_DURATION);
    setCompletedOrders([]);
    setAvailableOrders([]);
    setCurrentOrder(null);
    setPhase(GameState.GAME_LOOP);
    setIsPaused(false);
  };

  const handleSelectOrder = (order: ActiveOrder) => {
    if (currentOrder) return; // Busy
    setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
    setCurrentOrder(order);
    setInternalTemp(INITIAL_ROOM_TEMP); // Reset mix temp
    setLastFeedback(null);
  };

  const handleAdjustIce = (amount: number) => {
    if (isPaused) return;
    setBathTemp(prev => {
        const next = prev + amount;
        return Math.max(-40, Math.min(10, next));
    });
  };

  const handleServe = () => {
    if (!currentOrder || isPaused) return;

    // Score Calculation
    const [min, max] = currentOrder.targetTempRange;
    const mid = (min + max) / 2;
    const diff = Math.abs(internalTemp - mid);
    const tolerance = (max - min) / 2;
    
    let score = 0;
    let feedback = { emoji: '🤔', text: '?', color: 'text-slate-500' };

    if (internalTemp >= min && internalTemp <= max) {
        score = 100;
        feedback = { emoji: '🤩', text: '¡Perfecto!', color: 'text-green-500' };
    } else {
        // Penalty logic
        const error = diff - tolerance;
        if (error > 0) {
            score = Math.max(0, 100 - (error * 15));
            if (internalTemp < min) {
                feedback = { emoji: '🥶', text: 'Muy Duro', color: 'text-cyan-500' };
            } else {
                feedback = { emoji: '🫠', text: 'Muy Aguado', color: 'text-red-500' };
            }
        } else {
            // Technically out of exact min/max but within floating point tolerance or very close
            score = 90;
            feedback = { emoji: '🙂', text: 'Bien', color: 'text-yellow-500' };
        }
    }

    // Determine final Feedback based on strict score just in case
    if (score >= 98) feedback = { emoji: '🤩', text: '¡Perfecto!', color: 'text-green-500' };
    else if (score >= 70) feedback = { emoji: '🙂', text: 'Bien', color: 'text-yellow-500' };
    
    setLastFeedback(feedback);
    setCompletedOrders(prev => [...prev, { order: currentOrder, score }]);
    setCurrentOrder(null);
    
    // Auto-hide feedback after delay
    setTimeout(() => {
        setLastFeedback(null);
    }, 1500);
  };

  // --- GAME OVER STATS ---
  const getStarRating = () => {
    if (completedOrders.length === 0) return 0;
    const avgScore = completedOrders.reduce((acc, curr) => acc + curr.score, 0) / completedOrders.length;
    const count = completedOrders.length;

    if (avgScore > 90 && count >= 5) return 3;
    if (avgScore > 70 && count >= 3) return 2;
    if (count > 0) return 1;
    return 0;
  };


  // --- RENDER: DIFFICULTY SELECTION ---
  if (phase === GameState.GAME_DIFFICULTY) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-slate-800">Selecciona Dificultad</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                <button 
                    onClick={() => handleStartGame(Difficulty.EASY)}
                    className="p-8 bg-green-100 hover:bg-green-200 rounded-2xl border-4 border-green-300 flex flex-col items-center gap-4 transition-all hover:scale-105"
                >
                    <div className="text-4xl">🙂</div>
                    <div className="text-2xl font-bold text-green-800">Fácil</div>
                    <p className="text-center text-green-700">Ves temperaturas y rangos exactos. Ideal para aprender.</p>
                </button>
                <button 
                    onClick={() => handleStartGame(Difficulty.HARD)}
                    className="p-8 bg-red-100 hover:bg-red-200 rounded-2xl border-4 border-red-300 flex flex-col items-center gap-4 transition-all hover:scale-105"
                >
                    <div className="text-4xl">😎</div>
                    <div className="text-2xl font-bold text-red-800">Difícil</div>
                    <p className="text-center text-red-700">Sin termómetro digital. Guíate por la intuición y el tiempo.</p>
                </button>
            </div>
            <button onClick={onBack} className="text-slate-400 font-bold hover:text-slate-600">Cancelar</button>
        </div>
    );
  }

  // --- RENDER: GAME OVER ---
  if (phase === GameState.GAME_OVER) {
      const stars = getStarRating();
      const avgScore = completedOrders.length > 0 
        ? Math.round(completedOrders.reduce((acc, c) => acc + c.score, 0) / completedOrders.length) 
        : 0;

      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in zoom-in duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-lg w-full">
                <h2 className="text-4xl font-black text-slate-800 mb-6">¡Tiempo Agotado!</h2>
                
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3].map(s => (
                        <Star 
                            key={s} 
                            className={`w-16 h-16 ${s <= stars ? 'fill-yellow-400 text-yellow-500 animate-bounce' : 'text-slate-200'}`} 
                            style={{ animationDelay: `${s * 200}ms` }}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <div className="text-slate-500 text-sm uppercase font-bold">Helados</div>
                        <div className="text-3xl font-black text-slate-800">{completedOrders.length}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <div className="text-slate-500 text-sm uppercase font-bold">Calidad Promedio</div>
                        <div className={`text-3xl font-black ${avgScore > 80 ? 'text-green-500' : avgScore > 50 ? 'text-orange-500' : 'text-red-500'}`}>
                            {avgScore}%
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => handleStartGame(difficulty)}
                        className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600"
                    >
                        <RotateCcw className="w-5 h-5" /> Jugar de Nuevo
                    </button>
                    <button 
                        onClick={onBack}
                        className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-300"
                    >
                        <Home className="w-5 h-5" /> Menú
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- RENDER: GAME LOOP ---
  const activeMix = currentOrder ? AVAILABLE_MIXES.find(m => m.id === currentOrder.mixId)! : null;

  return (
    <div className="w-full max-w-6xl mx-auto h-full flex flex-col gap-4 relative">
        
        {/* PAUSE MODAL */}
        {isPaused && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <Pause className="w-10 h-10 fill-current" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800">Juego Pausado</h2>
                        <p className="text-slate-500 font-medium">¿Necesitas un descanso?</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => setIsPaused(false)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 transition-transform hover:scale-105"
                        >
                            <Play className="w-6 h-6 fill-current" /> Continuar
                        </button>
                        <button 
                            onClick={onBack}
                            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <LogOut className="w-6 h-6" /> Salir al Menú
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* HUD */}
        <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 text-2xl font-mono font-bold ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    <Timer className="w-6 h-6" />
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="h-6 w-px bg-slate-700"></div>
                <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold">{completedOrders.length}</span> <span className="text-slate-400 text-sm hidden md:inline">Servidos</span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest hidden md:block">{difficulty}</div>
                <button 
                    onClick={() => setIsPaused(true)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
                    title="Pausar"
                >
                    <Pause className="w-6 h-6" />
                </button>
            </div>
        </div>

        {/* ORDER QUEUE */}
        <div className="h-32 w-full overflow-x-auto">
            <div className="flex gap-4 h-full min-w-max p-2">
                {availableOrders.length === 0 && !currentOrder && (
                     <div className="w-64 flex items-center justify-center text-slate-400 italic bg-white/50 rounded-xl border-2 border-dashed border-slate-300">
                        Esperando clientes...
                     </div>
                )}
                
                {availableOrders.map(order => {
                    const mix = AVAILABLE_MIXES.find(m => m.id === order.mixId)!;
                    return (
                        <button 
                            key={order.id}
                            onClick={() => handleSelectOrder(order)}
                            disabled={!!currentOrder || isPaused}
                            className={`w-64 bg-white rounded-xl shadow-md border-l-8 p-3 flex flex-col justify-between text-left transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                            style={{ borderLeftColor: mix.color }}
                        >
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-slate-800 truncate">{mix.name}</span>
                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 uppercase font-bold">{order.size}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                {order.mass}g • {order.customerName}
                            </div>
                            <div className="mt-2 flex justify-between items-end">
                                <div className="text-xs font-bold uppercase tracking-wide text-slate-600 bg-slate-50 p-1 rounded">
                                    {order.preference}
                                </div>
                                {difficulty === Difficulty.EASY && (
                                    <div className="text-[10px] font-mono text-slate-400">
                                        {order.targetTempRange[0]}°/{order.targetTempRange[1]}°
                                    </div>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>

        {/* MAIN ARCADE AREA */}
        <div className="flex-1 bg-white rounded-3xl shadow-xl overflow-hidden relative flex flex-col md:flex-row min-h-[400px]">
            
            {/* LEFT: ADD ICE (LOWER TEMP) */}
            <div className="w-full md:w-32 bg-blue-50 border-r border-slate-100 flex md:flex-col items-center justify-center p-4 gap-4 transition-colors duration-300"
                 style={{ backgroundColor: `rgba(239, 246, 255, ${Math.max(0.2, Math.min(1, Math.abs(bathTemp)/20))})` }}>
                <button 
                    onClick={() => handleAdjustIce(-5)}
                    className="w-20 h-20 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-[0_4px_0_rgb(29,78,216)] active:shadow-none active:translate-y-1 flex items-center justify-center transition-all disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_rgb(29,78,216)]"
                    disabled={isPaused}
                >
                    <Plus className="w-10 h-10" />
                </button>
                <div className="text-center select-none">
                    <div className="text-sm text-blue-900 font-bold uppercase">Echar Hielo</div>
                    <div className="text-xs text-blue-500">Baja Temp</div>
                </div>
            </div>

            {/* CENTER: GARRAFA */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-8 bg-slate-50">
                {/* Info Bar */}
                <div className="absolute top-4 w-full px-8 flex justify-between pointer-events-none z-10">
                     <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                            <Snowflake className="w-3 h-3" /> Baño de Hielo
                        </div>
                        <div className="text-2xl font-mono font-bold text-blue-600">{bathTemp}°C</div>
                     </div>
                </div>

                {/* The Machine & Feedback Overlay */}
                <div className="relative my-4 scale-110 md:scale-125 transition-all">
                     {currentOrder && activeMix ? (
                         <div className="relative">
                            <SimulationVisualizer 
                                mix={activeMix}
                                currentTemp={internalTemp}
                                phase={
                                    internalTemp > -2 ? 'liquid' : 
                                    internalTemp > -8 ? 'soft' : 'hard'
                                }
                            />
                            {/* FEEDBACK OVERLAY */}
                            {lastFeedback && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center animate-in zoom-in fade-in duration-300">
                                    <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-2xl flex flex-col items-center transform scale-125">
                                        <div className="text-5xl animate-bounce">{lastFeedback.emoji}</div>
                                        <div className={`text-lg font-black mt-2 ${lastFeedback.color}`}>{lastFeedback.text}</div>
                                    </div>
                                </div>
                            )}
                         </div>
                     ) : (
                         <div className="w-64 h-64 rounded-full border-8 border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-bold text-xl bg-slate-100/50 animate-pulse">
                             SELECCIONA PEDIDO
                         </div>
                     )}
                </div>
                
                {/* Thermometer */}
                {currentOrder && (
                    <div className="mt-8 flex flex-col items-center gap-2">
                        <div className={`px-8 py-4 rounded-xl font-mono text-3xl font-black shadow-inner transition-colors flex items-center gap-2 ${
                            difficulty === Difficulty.HARD 
                                ? 'bg-slate-200 text-slate-300 select-none' 
                                : 'bg-slate-800 text-white'
                        }`}>
                            <ThermometerSnowflake className="w-6 h-6" />
                            {difficulty === Difficulty.HARD ? '??.?' : internalTemp.toFixed(1)}°C
                        </div>
                        {difficulty === Difficulty.EASY && (
                            <div className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                Meta: {currentOrder.targetTempRange[0]}° a {currentOrder.targetTempRange[1]}°
                            </div>
                        )}
                    </div>
                )}

                {/* ACTION BUTTON */}
                {currentOrder && !lastFeedback && (
                    <button 
                        onClick={handleServe}
                        disabled={isPaused}
                        className="mt-6 bg-green-500 hover:bg-green-600 text-white w-64 py-4 rounded-xl font-black text-xl shadow-[0_4px_0_rgb(21,128,61)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2 disabled:opacity-50 disabled:transform-none"
                    >
                        <CheckCircle className="w-6 h-6" /> SERVIR
                    </button>
                )}
            </div>

            {/* RIGHT: REMOVE ICE (RAISE TEMP) */}
            <div className="w-full md:w-32 bg-red-50 border-l border-slate-100 flex md:flex-col items-center justify-center p-4 gap-4">
                 <button 
                    onClick={() => handleAdjustIce(5)}
                    className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_0_rgb(185,28,28)] active:shadow-none active:translate-y-1 flex items-center justify-center transition-all disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_rgb(185,28,28)]"
                    disabled={isPaused}
                >
                    <Minus className="w-10 h-10" />
                </button>
                 <div className="text-center select-none">
                    <div className="text-sm text-red-900 font-bold uppercase">Quitar Hielo</div>
                    <div className="text-xs text-red-500">Sube Temp</div>
                </div>
            </div>
        </div>
    </div>
  );
};