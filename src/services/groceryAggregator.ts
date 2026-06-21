import { PlannerEntry } from "../types";

export interface GroceryItem {
  name: string;
  amount: number;
  unit: string;
}

export type GroupedGroceryList = Record<string, GroceryItem[]>;

export function aggregateGroceryList(weekEntries: PlannerEntry[]): GroupedGroceryList {
  const map = new Map<string, { name: string; amount: number; unit: string; category: string }>();

  weekEntries.forEach(entry => {
    entry.recipe.ingredients.forEach(ing => {
      const key = `${ing.name.toLowerCase()}_${ing.unit}`;
      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.amount = Math.round((existing.amount + ing.amount) * 10) / 10;
      } else {
        map.set(key, {
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          category: ing.category || "Pantry",
        });
      }
    });
  });

  const grouped: GroupedGroceryList = {};
  map.forEach(item => {
    const category = item.category || "Pantry";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({
      name: item.name,
      amount: item.amount,
      unit: item.unit,
    });
  });

  return grouped;
}
