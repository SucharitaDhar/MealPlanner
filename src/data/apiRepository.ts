import { Recipe } from "../types";

interface TranscribeIngredient {
  name?: string;
  amount?: number;
  unit?: string;
  caloriesPerUnit?: number;
  proteinPerUnit?: number;
  carbsPerUnit?: number;
  fatPerUnit?: number;
  category?: string;
}

interface TranscribeRecipeResponse {
  id?: string;
  title?: string;
  description?: string;
  servings?: number;
  cookTime?: string;
  difficulty?: string;
  ingredients?: TranscribeIngredient[];
  steps?: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
}

export const apiRepository = {
  async transcribeFromUrl(url: string, apiKey: string): Promise<Recipe> {
    const res = await fetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim(), apiKey }),
    });

    const data = await res.json() as TranscribeRecipeResponse & { error?: string };
    if (!res.ok) {
      throw new Error(data.error || "Transcription failed");
    }

    return this.mapToRecipe(data, url, "url");
  },

  async transcribeFromText(text: string, apiKey: string): Promise<Recipe> {
    const res = await fetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim(), apiKey }),
    });

    const data = await res.json() as TranscribeRecipeResponse & { error?: string };
    if (!res.ok) {
      throw new Error(data.error || "Transcription failed");
    }

    return this.mapToRecipe(data, "", "text");
  },

  mapToRecipe(data: TranscribeRecipeResponse, url: string, type: "url" | "text"): Recipe {
    const source = type === "url"
      ? (url.includes("youtube") ? "YouTube" : url.includes("instagram") ? "Instagram" : "Web")
      : "Text";

    const recipe: Recipe = {
      id: data.id || `r-${Date.now()}`,
      title: data.title || "Untitled Recipe",
      description: data.description || "",
      servings: data.servings || 2,
      cookTime: data.cookTime || "30 min",
      difficulty: data.difficulty || "Medium",
      ingredients: (data.ingredients || []).map((ing: TranscribeIngredient) => ({
        name: ing.name || "Ingredient",
        amount: ing.amount || 0,
        unit: ing.unit || "g",
        caloriesPerUnit: ing.caloriesPerUnit || 0,
        proteinPerUnit: ing.proteinPerUnit || 0,
        carbsPerUnit: ing.carbsPerUnit || 0,
        fatPerUnit: ing.fatPerUnit || 0,
        category: ing.category || "Pantry",
      })),
      steps: data.steps || [],
      source,
      sourceUrl: url,
      imageUrl: data.imageUrl || "",
      thumbnailUrl: data.thumbnailUrl || "",
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    };

    // Calculate totals
    recipe.ingredients.forEach(i => {
      recipe.totalCalories += Math.round(i.amount * i.caloriesPerUnit);
      recipe.totalProtein += Math.round(i.amount * i.proteinPerUnit);
      recipe.totalCarbs += Math.round(i.amount * i.carbsPerUnit);
      recipe.totalFat += Math.round(i.amount * i.fatPerUnit);
    });

    return recipe;
  }
};
