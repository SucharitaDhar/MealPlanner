import { Recipe, Ingredient } from "../types";

export interface ScaledRecipeResult {
  factor: number;
  ingredients: Ingredient[];
  totalCal: number;
  totalP: number;
  totalC: number;
  totalF: number;
}

export interface PortionSplitResult {
  pctA: number;
  pctB: number;
  gramsA: number | null;
  gramsB: number | null;
  calA: number;
  calB: number;
}

export function scaleRecipe(recipe: Recipe, targetCalories: number): ScaledRecipeResult {
  if (recipe.totalCalories <= 0 || targetCalories <= 0) {
    return {
      factor: 1,
      ingredients: recipe.ingredients,
      totalCal: recipe.totalCalories,
      totalP: recipe.totalProtein,
      totalC: recipe.totalCarbs,
      totalF: recipe.totalFat,
    };
  }

  const factor = targetCalories / recipe.totalCalories;
  const ingredients = recipe.ingredients.map(i => ({
    ...i,
    amount: Math.round(i.amount * factor * 10) / 10,
  }));

  return {
    factor,
    ingredients,
    totalCal: Math.round(recipe.totalCalories * factor),
    totalP: Math.round(recipe.totalProtein * factor),
    totalC: Math.round(recipe.totalCarbs * factor),
    totalF: Math.round(recipe.totalFat * factor),
  };
}

export function calculatePortionSplit(
  totalCal: number,
  calA: number,
  calB: number,
  cookedWeightStr: string
): PortionSplitResult | null {
  if (totalCal <= 0) return null;
  const total = calA + calB;
  if (total <= 0) return null;

  const pctA = calA / total;
  const pctB = calB / total;
  const cw = parseFloat(cookedWeightStr) || 0;

  return {
    pctA: Math.round(pctA * 100),
    pctB: Math.round(pctB * 100),
    gramsA: cw > 0 ? Math.round(cw * pctA) : null,
    gramsB: cw > 0 ? Math.round(cw * pctB) : null,
    calA: Math.round(totalCal * pctA),
    calB: Math.round(totalCal * pctB),
  };
}
