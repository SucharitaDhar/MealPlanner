"use client";

import React, { createContext, useContext, useState, useEffect, startTransition } from "react";
import { UserProfile, Person2Profile, Recipe, PlannerEntry, MealSlot } from "../types";
import { createClient } from "../lib/supabase/client";

interface AppState {
  profile: UserProfile | null;
  person2Profile: Person2Profile | null;
  recipes: Recipe[];
  planner: PlannerEntry[];
  apiKey: string;
  activeTab: string;
  loaded: boolean;
  user: any | null; // Supabase Auth User
}

interface AppStateContextType extends AppState {
  setActiveTab: (tab: string) => void;
  updateProfile: (profile: UserProfile | null) => Promise<void>;
  updatePerson2Profile: (profile: Person2Profile | null) => Promise<void>;
  saveRecipe: (recipe: Recipe) => Promise<void>;
  addPlannerEntry: (recipe: Recipe, slot: MealSlot) => Promise<void>;
  removePlannerEntry: (week: number, day: number, slot: string) => Promise<void>;
  updateApiKey: (apiKey: string) => void;
  logout: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Helper to convert database recipe to frontend camelCase recipe
function mapDbRecipeToFrontend(dbRecipe: any): Recipe {
  return {
    id: dbRecipe.id,
    title: dbRecipe.title,
    description: dbRecipe.description || "",
    servings: dbRecipe.servings || 2,
    cookTime: dbRecipe.cook_time || "30 min",
    difficulty: dbRecipe.difficulty || "Medium",
    ingredients: dbRecipe.ingredients || [],
    steps: dbRecipe.steps || [],
    source: dbRecipe.source || "Web",
    sourceUrl: dbRecipe.source_url || "",
    imageUrl: dbRecipe.image_url || undefined,
    thumbnailUrl: dbRecipe.thumbnail_url || undefined,
    totalCalories: dbRecipe.total_calories || 0,
    totalProtein: dbRecipe.total_protein || 0,
    totalCarbs: dbRecipe.total_carbs || 0,
    totalFat: dbRecipe.total_fat || 0,
  };
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [person2Profile, setPerson2Profile] = useState<Person2Profile | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [planner, setPlanner] = useState<PlannerEntry[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [activeTab, setActiveTab] = useState("transcribe");
  const [loaded, setLoaded] = useState(false);

  const supabase = createClient();

  // Load API key from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("tasty_api_key") || "";
      setApiKey(storedKey);
    }
  }, []);

  // Listen to Supabase Auth Changes and load sync data
  useEffect(() => {
    let active = true;

    const loadData = async (sessionUser: any) => {
      if (!sessionUser) {
        startTransition(() => {
          setUser(null);
          setProfile(null);
          setPerson2Profile(null);
          setRecipes([]);
          setPlanner([]);
          setLoaded(true);
        });
        return;
      }

      try {
        // 1. Fetch profiles table row
        const { data: profileData, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .maybeSingle();

        if (profileErr) throw profileErr;

        // If no weight is found, it means onboarding is not completed yet
        let formattedProfile: UserProfile | null = null;
        if (profileData && profileData.weight) {
          formattedProfile = {
            weight: profileData.weight,
            height: profileData.height,
            age: profileData.age,
            gender: profileData.gender,
            activityLevel: profileData.activity_level,
            goal: profileData.goal,
            calories: profileData.calories,
            protein: profileData.protein,
            carbs: profileData.carbs,
            fat: profileData.fat,
            apiKey: "", // Handle API key client side via localStorage
          };
        }

        // 2. Fetch household_members (Person 2)
        const { data: p2Data, error: p2Err } = await supabase
          .from("household_members")
          .select("*")
          .eq("profile_id", sessionUser.id)
          .maybeSingle();

        if (p2Err) throw p2Err;

        let formattedP2: Person2Profile | null = null;
        if (p2Data) {
          formattedP2 = {
            weight: p2Data.weight || "",
            height: p2Data.height || "",
            age: p2Data.age || "",
            gender: p2Data.gender || "female",
            activityLevel: p2Data.activity_level || "moderate",
            goal: p2Data.goal || "maintain",
            calories: p2Data.calories || 0,
            protein: p2Data.protein || 0,
            carbs: p2Data.carbs || 0,
            fat: p2Data.fat || 0,
          };
        }

        // 3. Fetch saved recipes
        const { data: savedRecipesData, error: recipesErr } = await supabase
          .from("saved_recipes")
          .select("recipe:recipes (*)")
          .eq("profile_id", sessionUser.id);

        if (recipesErr) throw recipesErr;

        const formattedRecipes: Recipe[] = (savedRecipesData || [])
          .filter((item: any) => item.recipe)
          .map((item: any) => mapDbRecipeToFrontend(item.recipe));

        // 4. Fetch meal plan entries
        const { data: plannerData, error: plannerErr } = await supabase
          .from("meal_plan")
          .select("week, day, slot, recipe:recipes (*)")
          .eq("profile_id", sessionUser.id);

        if (plannerErr) throw plannerErr;

        const formattedPlanner: PlannerEntry[] = (plannerData || [])
          .filter((item: any) => item.recipe)
          .map((item: any) => ({
            week: item.week,
            day: item.day,
            slot: item.slot as "breakfast" | "lunch" | "dinner",
            recipe: mapDbRecipeToFrontend(item.recipe),
          }));

        if (active) {
          startTransition(() => {
            setUser(sessionUser);
            setProfile(formattedProfile);
            setPerson2Profile(formattedP2);
            setRecipes(formattedRecipes);
            setPlanner(formattedPlanner);
            setLoaded(true);
          });
        }
      } catch (err) {
        console.error("Error loading Supabase sync data:", err);
        if (active) {
          startTransition(() => {
            setUser(sessionUser);
            setLoaded(true);
          });
        }
      }
    };

    // Initialize session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadData(session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadData(session?.user || null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateProfile = async (p: UserProfile | null) => {
    if (!user) return;

    try {
      if (p) {
        const { error } = await supabase.from("profiles").upsert({
          id: user.id,
          weight: p.weight,
          height: p.height,
          age: p.age,
          gender: p.gender,
          activity_level: p.activityLevel,
          goal: p.goal,
          calories: p.calories,
          protein: p.protein,
          carbs: p.carbs,
          fat: p.fat,
        });

        if (error) throw error;
        setProfile(p);
      } else {
        const { error } = await supabase.from("profiles").delete().eq("id", user.id);
        if (error) throw error;
        setProfile(null);
      }
    } catch (err) {
      console.error("Error updating user profile:", err);
    }
  };

  const updatePerson2Profile = async (p2: Person2Profile | null) => {
    if (!user) return;

    try {
      if (p2) {
        // Since we check for maybeSingle, we can upsert household members. 
        // We'll query first to find the primary household member if it exists
        const { data: existing } = await supabase
          .from("household_members")
          .select("id")
          .eq("profile_id", user.id)
          .maybeSingle();

        const payload = {
          profile_id: user.id,
          name: "Person 2",
          weight: p2.weight,
          height: p2.height,
          age: p2.age,
          gender: p2.gender,
          activity_level: p2.activityLevel,
          goal: p2.goal,
          calories: p2.calories,
          protein: p2.protein,
          carbs: p2.carbs,
          fat: p2.fat,
        };

        if (existing?.id) {
          const { error } = await supabase
            .from("household_members")
            .update(payload)
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("household_members").insert(payload);
          if (error) throw error;
        }
        setPerson2Profile(p2);
      } else {
        const { error } = await supabase
          .from("household_members")
          .delete()
          .eq("profile_id", user.id);
        if (error) throw error;
        setPerson2Profile(null);
      }
    } catch (err) {
      console.error("Error updating Person 2 profile:", err);
    }
  };

  const saveRecipe = async (recipe: Recipe) => {
    if (!user) return;

    try {
      // 1. Check if the recipe already exists by UUID (or just insert to generate new UUID)
      // Since demo recipes might have string IDs, we'll strip them and let the database generate the UUID
      const cleanRecipeId = recipe.id.startsWith("demo-") || recipe.id.startsWith("paste-")
        ? undefined
        : recipe.id;

      const { data: newRecipe, error: recipeErr } = await supabase
        .from("recipes")
        .insert({
          ...(cleanRecipeId ? { id: cleanRecipeId } : {}),
          title: recipe.title,
          description: recipe.description,
          servings: recipe.servings,
          cook_time: recipe.cookTime,
          difficulty: recipe.difficulty,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          source: recipe.source,
          source_url: recipe.sourceUrl,
          image_url: recipe.imageUrl,
          thumbnail_url: recipe.thumbnailUrl,
          total_calories: recipe.totalCalories,
          total_protein: recipe.totalProtein,
          total_carbs: recipe.totalCarbs,
          total_fat: recipe.totalFat,
        })
        .select()
        .single();

      if (recipeErr) throw recipeErr;

      // 2. Add to saved_recipes junction table
      const { error: saveErr } = await supabase.from("saved_recipes").insert({
        profile_id: user.id,
        recipe_id: newRecipe.id,
      });

      if (saveErr) throw saveErr;

      // 3. Update local state
      const frontendRecipe = mapDbRecipeToFrontend(newRecipe);
      setRecipes((prev) => [...prev, frontendRecipe]);
    } catch (err) {
      console.error("Error saving recipe to database:", err);
    }
  };

  const addPlannerEntry = async (recipe: Recipe, slot: MealSlot) => {
    if (!user) return;

    try {
      // 1. Delete any existing entry in that week, day, and slot
      const { error: deleteErr } = await supabase
        .from("meal_plan")
        .delete()
        .eq("profile_id", user.id)
        .eq("week", slot.week)
        .eq("day", slot.day)
        .eq("slot", slot.slot);

      if (deleteErr) throw deleteErr;

      // 2. Insert new entry
      const { error: insertErr } = await supabase.from("meal_plan").insert({
        profile_id: user.id,
        recipe_id: recipe.id,
        week: slot.week,
        day: slot.day,
        slot: slot.slot,
      });

      if (insertErr) throw insertErr;

      // 3. Update local state
      setPlanner((prev) => {
        const filtered = prev.filter(
          (e) => !(e.week === slot.week && e.day === slot.day && e.slot === slot.slot)
        );
        return [...filtered, { week: slot.week, day: slot.day, slot: slot.slot, recipe }];
      });
    } catch (err) {
      console.error("Error adding meal planner entry:", err);
    }
  };

  const removePlannerEntry = async (week: number, day: number, slot: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("meal_plan")
        .delete()
        .eq("profile_id", user.id)
        .eq("week", week)
        .eq("day", day)
        .eq("slot", slot);

      if (error) throw error;

      setPlanner((prev) =>
        prev.filter((e) => !(e.week === week && e.day === day && e.slot === slot))
      );
    } catch (err) {
      console.error("Error removing meal planner entry:", err);
    }
  };

  const updateApiKey = (key: string) => {
    setApiKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("tasty_api_key", key);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error logging out from Supabase:", err);
    }

    startTransition(() => {
      setUser(null);
      setProfile(null);
      setPerson2Profile(null);
      setRecipes([]);
      setPlanner([]);
      setApiKey("");
      setActiveTab("transcribe");
    });
  };

  return (
    <AppStateContext.Provider
      value={{
        profile,
        person2Profile,
        recipes,
        planner,
        apiKey,
        activeTab,
        loaded,
        user,
        setActiveTab,
        updateProfile,
        updatePerson2Profile,
        saveRecipe,
        addPlannerEntry,
        removePlannerEntry,
        updateApiKey,
        logout,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
