import { IceCreamMix, IngredientType } from '../types';
import { INGREDIENTS, BASE_HEAT_TRANSFER_COEFFICIENT } from '../constants';

export const calculateMixProperties = (mix: { type: IngredientType; amount: number }[]): { totalMass: number, averageSpecificHeat: number, freezingPoint: number } => {
  let totalMass = 0;
  let totalHeatCapacity = 0;
  let totalSugar = 0;
  let totalLiquid = 0;

  mix.forEach(item => {
    const data = INGREDIENTS[item.type];
    totalMass += item.amount;
    totalHeatCapacity += (item.amount * data.specificHeat);
    
    if (item.type === IngredientType.SUGAR) {
      totalSugar += item.amount;
    } else {
      totalLiquid += item.amount;
    }
  });

  const averageSpecificHeat = totalHeatCapacity / totalMass;
  
  // Simplified freezing point depression approximation
  // More sugar = lower freezing point
  const sugarConcentration = totalSugar / (totalSugar + totalLiquid);
  // Pure water freezes at 0. Approx -1.86 C per mole/kg. Simplified linear model for game.
  const freezingPoint = -(sugarConcentration * 10) * 1.5; 

  return { totalMass, averageSpecificHeat, freezingPoint };
};

/**
 * Calculates the new temperature after a time step using Newton's Law of Cooling
 * dT/dt = -k * (T_obj - T_env)
 * k = (h * A) / (m * c)
 */
export const calculateNextStep = (
  currentTemp: number,
  bathTemp: number,
  mass: number,
  specificHeat: number,
  dt: number // time step in seconds
): number => {
  // k represents the cooling constant based on physical properties
  // We divide by mass and specific heat: Higher mass or higher Cp means SLOWER temp change (smaller k)
  const k = (BASE_HEAT_TRANSFER_COEFFICIENT * 10) / (mass * specificHeat);
  
  const change = -k * (currentTemp - bathTemp) * dt;
  return currentTemp + change;
};
