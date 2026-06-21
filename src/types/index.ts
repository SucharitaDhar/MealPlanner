export interface UserProfile {
  weight: string;
  height: string;
  age: string;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  goal: "lose" | "maintain" | "gain";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  apiKey: string;
}

export interface Person2Profile {
  weight: string;
  height: string;
  age: string;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  goal: "lose" | "maintain" | "gain";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  caloriesPerUnit: number;
  proteinPerUnit: number;
  carbsPerUnit: number;
  fatPerUnit: number;
  category?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  cookTime: string;
  difficulty: string;
  ingredients: Ingredient[];
  steps: string[];
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MealSlot {
  week: number;
  day: number;
  slot: "breakfast" | "lunch" | "dinner";
}

export interface PlannerEntry {
  week: number;
  day: number;
  slot: "breakfast" | "lunch" | "dinner";
  recipe: Recipe;
}
