import { UserProfile, Person2Profile, Recipe, PlannerEntry } from "../types";

export const localStorageRepository = {
  getUserProfile(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem("tasty_user_profile");
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  saveUserProfile(profile: UserProfile | null): void {
    if (typeof window === "undefined") return;
    if (profile) {
      localStorage.setItem("tasty_user_profile", JSON.stringify(profile));
    } else {
      localStorage.removeItem("tasty_user_profile");
    }
  },

  getPerson2Profile(): Person2Profile | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem("tasty_person2_profile");
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  savePerson2Profile(profile: Person2Profile | null): void {
    if (typeof window === "undefined") return;
    if (profile) {
      localStorage.setItem("tasty_person2_profile", JSON.stringify(profile));
    } else {
      localStorage.removeItem("tasty_person2_profile");
    }
  },

  getSavedRecipes(): Recipe[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem("tasty_saved_recipes");
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveSavedRecipes(recipes: Recipe[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("tasty_saved_recipes", JSON.stringify(recipes));
  },

  getPlannerEntries(): PlannerEntry[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem("tasty_planner_entries");
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  savePlannerEntries(entries: PlannerEntry[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("tasty_planner_entries", JSON.stringify(entries));
  },

  getApiKey(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("tasty_api_key") || "";
  },

  saveApiKey(apiKey: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("tasty_api_key", apiKey);
  },

  clearAll(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("tasty_user_profile");
    localStorage.removeItem("tasty_person2_profile");
    localStorage.removeItem("tasty_saved_recipes");
    localStorage.removeItem("tasty_planner_entries");
    localStorage.removeItem("tasty_api_key");
  }
};
