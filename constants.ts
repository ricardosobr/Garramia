import { Ingredient, IngredientType, IceCreamMix, ServingSize, TexturePreference } from './types';

export const INGREDIENTS: Record<IngredientType, Ingredient> = {
  [IngredientType.CREAM]: { name: IngredientType.CREAM, specificHeat: 3.2, density: 0.99, color: '#FDF4E3' },
  [IngredientType.MILK]: { name: IngredientType.MILK, specificHeat: 3.9, density: 1.03, color: '#FFFFFF' },
  [IngredientType.WATER]: { name: IngredientType.WATER, specificHeat: 4.18, density: 1.0, color: '#E0F2FE' },
  [IngredientType.SUGAR]: { name: IngredientType.SUGAR, specificHeat: 1.2, density: 1.59, color: '#F3F4F6' },
  [IngredientType.FRUIT]: { name: IngredientType.FRUIT, specificHeat: 3.6, density: 1.1, color: '#FDA4AF' },
  [IngredientType.CARAMEL]: { name: IngredientType.CARAMEL, specificHeat: 2.2, density: 1.3, color: '#D97706' },
  [IngredientType.LIME]: { name: IngredientType.LIME, specificHeat: 4.0, density: 1.02, color: '#bef264' },
};

export const BASE_HEAT_TRANSFER_COEFFICIENT = 0.8; 
export const INITIAL_ROOM_TEMP = 20;

export const SIZE_MASS_MAP: Record<ServingSize, number> = {
  [ServingSize.SMALL]: 100,
  [ServingSize.MEDIUM]: 250,
  [ServingSize.LARGE]: 500,
};

// Target Logic:
// Hard: User wants it between -20 and -12.
// Soft: User wants it "Aguado" (Warmer, near melting point, approx -2 to -4).
// Creamy: The Mix's specific ideal temp (usually -5 to -8).
export const TEXTURE_TEMP_OFFSETS: Record<TexturePreference, [number, number]> = {
  [TexturePreference.HARD]: [-20, -12], // Absolute range target override
  [TexturePreference.CREAMY]: [-1.5, 1.5], // Offset from base
  [TexturePreference.SOFT]: [2, 6], // Offset warmer from base
};

export const AVAILABLE_MIXES: IceCreamMix[] = [
  {
    id: 'vanilla',
    name: "Vainilla Clásica",
    description: "La receta de la abuela.",
    ingredients: [{ type: IngredientType.CREAM, amount: 200 }, { type: IngredientType.MILK, amount: 100 }, { type: IngredientType.SUGAR, amount: 50 }],
    baseTargetTemp: -6,
    color: '#FDF4E3'
  },
  {
    id: 'strawberry',
    name: "Sorbete de Fresa",
    description: "Fresco y ligero.",
    ingredients: [{ type: IngredientType.WATER, amount: 200 }, { type: IngredientType.FRUIT, amount: 150 }, { type: IngredientType.SUGAR, amount: 80 }],
    baseTargetTemp: -5,
    color: '#FDA4AF'
  },
  {
    id: 'chocolate',
    name: "Choco Oscuro",
    description: "Denso y pesado.",
    ingredients: [{ type: IngredientType.MILK, amount: 250 }, { type: IngredientType.SUGAR, amount: 60 }, { type: IngredientType.CREAM, amount: 50 }],
    baseTargetTemp: -8,
    color: '#3F2C22'
  },
  {
    id: 'lime',
    name: "Nieve de Limón",
    description: "Pura agua helada.",
    ingredients: [{ type: IngredientType.WATER, amount: 300 }, { type: IngredientType.LIME, amount: 100 }, { type: IngredientType.SUGAR, amount: 100 }],
    baseTargetTemp: -4,
    color: '#bef264'
  },
  {
    id: 'caramel',
    name: "Dulce de Leche",
    description: "Pegajoso y difícil de congelar.",
    ingredients: [{ type: IngredientType.MILK, amount: 150 }, { type: IngredientType.CARAMEL, amount: 200 }, { type: IngredientType.CREAM, amount: 50 }],
    baseTargetTemp: -7,
    color: '#D97706'
  }
];

export const CUSTOMER_NAMES = ["Ana", "Beto", "Carla", "Dante", "Elena", "Fer", "Gaby", "Hugo", "Ivan", "Juli"];