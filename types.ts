export enum GameState {
  MENU = 'MENU',
  TUTORIAL = 'TUTORIAL', // New state for instructions
  LAB = 'LAB',
  GAME_DIFFICULTY = 'GAME_DIFFICULTY', // Choose Easy/Hard
  GAME_LOOP = 'GAME_LOOP', // The active arcade loop
  GAME_OVER = 'GAME_OVER', // Final score
}

export enum Difficulty {
  EASY = 'Fácil', // Shows temps and guides
  HARD = 'Difícil', // Hides specific mix temp, relies on visuals/time
}

export enum IngredientType {
  CREAM = 'Crema',
  MILK = 'Leche',
  SUGAR = 'Azúcar',
  FRUIT = 'Puré de Fruta',
  WATER = 'Agua (Sorbete)',
  CARAMEL = 'Cajeta/Dulce',
  LIME = 'Jugo de Limón',
}

export enum ServingSize {
  SMALL = 'Chico', // 100g
  MEDIUM = 'Mediano', // 250g
  LARGE = 'Grande', // 500g
}

export enum TexturePreference {
  HARD = 'Duro', // -20 to -12
  CREAMY = 'Cremoso', // Ideal specific to mix
  SOFT = 'Aguado', // Warmer, near melting
}

export interface Ingredient {
  name: IngredientType;
  specificHeat: number; // J/(g·°C)
  density: number; // g/cm³
  color: string;
}

export interface IceCreamMix {
  id: string;
  name: string;
  description: string;
  ingredients: { type: IngredientType; amount: number }[]; // Base ratio for medium
  baseTargetTemp: number; // Ideal creamy temp
  color: string;
}

export interface ActiveOrder {
  id: string;
  customerName: string;
  mixId: string;
  size: ServingSize;
  preference: TexturePreference;
  targetTempRange: [number, number]; // [min, max]
  mass: number; // Actual grams
  totalHeatCapacity: number; // Calculated property
  startTime: number;
}

export interface SimulationData {
  time: number;
  temp: number;
  target: number;
  bathTemp: number;
}