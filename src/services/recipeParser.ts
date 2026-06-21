import { Ingredient } from "../types";

export interface RecipeTotals {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export function calculateRecipeTotals(ingredients: Ingredient[]): RecipeTotals {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  ingredients.forEach(i => {
    totalCalories += Math.round(i.amount * i.caloriesPerUnit);
    totalProtein += Math.round(i.amount * i.proteinPerUnit);
    totalCarbs += Math.round(i.amount * i.carbsPerUnit);
    totalFat += Math.round(i.amount * i.fatPerUnit);
  });

  return {
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
  };
}
export function generateImagePrompt(title: string, description: string): string {
  return `minimalist hand-drawn cartoon food illustration of ${title}, ${description}, Forka cooking style, cozy warm cream background (#FAF0DC), vibrant food colors, culinary art, delicious look, high quality, vector style`;
}

export function generateDemoRecipeId(): string {
  return `r-${Date.now()}`;
}
