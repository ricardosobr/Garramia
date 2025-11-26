import { ActiveOrder, Difficulty, IceCreamMix } from "../types";

// Lógica local para generar feedback sin usar API Keys externas

export const generateOrderFeedback = async (
  order: ActiveOrder,
  finalTemp: number,
  difficulty: Difficulty
): Promise<string> => {
  const [min, max] = order.targetTempRange;
  
  if (finalTemp < min) return "Cliente: ¡Uy! Está muy dura, casi rompo la cuchara.";
  if (finalTemp > max) return "Cliente: Esto parece sopa... le falta frío.";
  return "Cliente: ¡Perfecto! Justo la textura que quería.";
};

export const generateCustomerFeedback = async (
  mix: IceCreamMix,
  finalTemp: number,
  timeTaken: number,
  bathTemp: number
): Promise<string> => {
  // Calculamos qué tan lejos quedó del objetivo
  const diff = Math.abs(finalTemp - mix.baseTargetTemp);
  
  let customer = "";
  let science = "";

  if (diff <= 1.5) {
    const praises = [
        "¡Está exquisita! Justo en el punto.", 
        "¡La mejor nieve de garrafa que he probado!", 
        "Textura perfecta, ni muy dura ni muy suave."
    ];
    customer = praises[Math.floor(Math.random() * praises.length)];
    science = `Lograste el equilibrio térmico perfecto. La temperatura final (${finalTemp.toFixed(1)}°C) permitió la cristalización ideal del agua y los lípidos.`;
  } else if (finalTemp < mix.baseTargetTemp) {
    const complaints = [
        "¡Está durísima! Se me congeló el cerebro.",
        "Necesito un picahielos para comer esto.",
        "Muy fría, perdió un poco el sabor."
    ];
    customer = complaints[Math.floor(Math.random() * complaints.length)];
    science = `La extracción de calor fue excesiva. Al bajar demasiado la temperatura, el agua formó cristales de hielo grandes y rígidos.`;
  } else {
    const complaints = [
        "Está muy aguada, parece malteada.",
        "Se derrite muy rápido, le faltó vuelta.",
        "Mmm... está tibia todavía."
    ];
    customer = complaints[Math.floor(Math.random() * complaints.length)];
    science = `La transferencia de calor (Q) fue insuficiente. La mezcla retuvo demasiada energía cinética y no logró cambiar de fase completamente.`;
  }

  // Mantenemos el formato esperado por ResultsSummary
  return `"Cliente: ${customer}" "Ciencia: ${science}"`;
};

export const generateLabInsight = async (
  mass: number,
  specificHeat: number,
  bathTemp: number,
  timeToFreeze: number
): Promise<string> => {
  return "Observación: Recuerda que a mayor masa (m) y mayor calor específico (c), mayor será la 'inercia térmica' del sistema, requiriendo más tiempo o un baño más frío para cambiar su temperatura.";
};