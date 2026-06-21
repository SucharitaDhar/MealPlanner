"use client";

import React, { useState, useCallback, useEffect, startTransition } from "react";
import { useAppState } from "../store/AppStateContext";
import RecipeTranscriber from "./RecipeTranscriber";
import RecipeDetailModal from "./RecipeDetailModal";
import MealPlanner from "./MealPlanner";
import RecipeCard from "./RecipeCard";
import type { Recipe, UserProfile, Person2Profile, MealSlot, PlannerEntry } from "../types";

export default function DashboardScreen({ profile, onLogout }: { profile: UserProfile; onLogout: () => void }) {
  const {
    person2Profile,
    recipes,
    planner,
    apiKey,
    activeTab,
    setActiveTab,
    updateProfile,
    updatePerson2Profile,
    addPlannerEntry,
    removePlannerEntry,
    updateApiKey,
  } = useAppState();

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Settings local edit states
  const [settingsApiKey, setSettingsApiKey] = useState(apiKey);
  const [editCalories, setEditCalories] = useState(profile?.calories || 2000);
  const [editProtein, setEditProtein] = useState(profile?.protein || 150);
  const [editCarbs, setEditCarbs] = useState(profile?.carbs || 200);
  const [editFat, setEditFat] = useState(profile?.fat || 65);

  const [edit2Calories, setEdit2Calories] = useState(person2Profile?.calories || 0);
  const [edit2Protein, setEdit2Protein] = useState(person2Profile?.protein || 0);
  const [edit2Carbs, setEdit2Carbs] = useState(person2Profile?.carbs || 0);
  const [edit2Fat, setEdit2Fat] = useState(person2Profile?.fat || 0);

  // Synchronize local edit states with global state
  useEffect(() => {
    if (profile) {
      startTransition(() => {
        setEditCalories(profile.calories);
        setEditProtein(profile.protein);
        setEditCarbs(profile.carbs);
        setEditFat(profile.fat);
      });
    }
  }, [profile]);

  useEffect(() => {
    if (person2Profile) {
      startTransition(() => {
        setEdit2Calories(person2Profile.calories);
        setEdit2Protein(person2Profile.protein);
        setEdit2Carbs(person2Profile.carbs);
        setEdit2Fat(person2Profile.fat);
      });
    } else {
      startTransition(() => {
        setEdit2Calories(0);
        setEdit2Protein(0);
        setEdit2Carbs(0);
        setEdit2Fat(0);
      });
    }
  }, [person2Profile]);

  useEffect(() => {
    startTransition(() => {
      setSettingsApiKey(apiKey);
    });
  }, [apiKey]);

  const handleUpdatePerson2Profile = useCallback((p2: Person2Profile | null) => {
    updatePerson2Profile(p2);
  }, [updatePerson2Profile]);


  // Wait, let's fix the destructuring of useAppState inside the save action or pull it from context. Let's make sure saveRecipe is pulled from context.
  const { saveRecipe: storeSaveRecipe } = useAppState();

  const handleLocalSaveRecipe = useCallback((recipe: Recipe) => {
    storeSaveRecipe(recipe);
    setActiveTab("recipes");
  }, [storeSaveRecipe, setActiveTab]);

  const handleAddToPlanner = useCallback((recipe: Recipe, slot: MealSlot) => {
    addPlannerEntry(recipe, slot);
    setActiveTab("planner");
  }, [addPlannerEntry, setActiveTab]);

  const handleRemoveEntry = useCallback((week: number, day: number, slot: string) => {
    removePlannerEntry(week, day, slot);
  }, [removePlannerEntry]);

  const handleAddPlannerEntry = useCallback((entry: PlannerEntry) => {
    addPlannerEntry(entry.recipe, { week: entry.week, day: entry.day, slot: entry.slot });
  }, [addPlannerEntry]);

  const saveSettings = () => {
    updateApiKey(settingsApiKey);
    if (profile) {
      updateProfile({
        ...profile,
        calories: editCalories,
        protein: editProtein,
        carbs: editCarbs,
        fat: editFat,
        apiKey: settingsApiKey
      });
    }

    if (person2Profile) {
      updatePerson2Profile({
        ...person2Profile,
        calories: edit2Calories,
        protein: edit2Protein,
        carbs: edit2Carbs,
        fat: edit2Fat
      });
    } else if (edit2Calories > 0) {
      updatePerson2Profile({
        weight: "", height: "", age: "", gender: "female", activityLevel: "sedentary", goal: "maintain",
        calories: edit2Calories,
        protein: edit2Protein,
        carbs: edit2Carbs,
        fat: edit2Fat
      });
    }
  };

  const TABS = [
    { id: "transcribe", label: "Transcribe", icon: "✨" },
    { id: "recipes", label: "My Recipes", icon: "📖" },
    { id: "planner", label: "Planner", icon: "📅" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar — desktop */}
      <aside className="sidebar hide-mobile">
        <div>
          <div className="sidebar-logo">Forka</div>
          <nav className="sidebar-nav">
            {TABS.map(t => (
              <button key={t.id}
                className={`nav-item ${activeTab === t.id ? "nav-item--active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div style={{ borderTop: "2.5px dashed var(--border-strong)", paddingTop: "var(--sp-4)" }}>
          <div className="text-xs text-muted" style={{ marginBottom: "var(--sp-1)" }}>
            Daily Target
          </div>
          <div className="text-bold" style={{ fontSize: "1.1rem" }}>{profile?.calories} kcal</div>
          <div className="text-xs text-muted" style={{ marginTop: "var(--sp-1)" }}>
            P {profile?.protein}g · C {profile?.carbs}g · F {profile?.fat}g
          </div>
        </div>
      </aside>

      {/* Bottom nav — mobile */}
      <nav className="nav-bottom hide-desktop">
        {TABS.map(t => (
          <button key={t.id}
            className={`nav-bottom-item ${activeTab === t.id ? "nav-bottom-item--active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span style={{ fontSize: "1.25rem" }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="main-content">
        {activeTab === "transcribe" && (
          <RecipeTranscriber onSaveRecipe={handleLocalSaveRecipe} />
        )}

        {activeTab === "recipes" && (
          <div className="stack stack-lg animate-in">
            <div>
              <h2>My Recipes</h2>
              <p className="text-sm text-muted" style={{ marginTop: "var(--sp-1)" }}>
                {recipes.length === 0
                  ? "No recipes saved yet. Transcribe your first recipe!"
                  : `${recipes.length} recipe${recipes.length > 1 ? "s" : ""} in your library`}
              </p>
            </div>

            {recipes.length === 0 ? (
              <div className="card text-center" style={{ padding: "var(--sp-16) var(--sp-6)" }}>
                <div style={{ fontSize: "3.5rem", marginBottom: "var(--sp-4)" }}>📖</div>
                <h3>Your recipe library is empty</h3>
                <p className="text-sm text-muted" style={{ marginTop: "var(--sp-2)", maxWidth: "380px", marginLeft: "auto", marginRight: "auto" }}>
                  Head to the Transcribe tab to import your first recipe from YouTube, Instagram, or paste it directly.
                </p>
                <button className="btn btn-primary" style={{ marginTop: "var(--sp-6)" }}
                  onClick={() => setActiveTab("transcribe")}>
                  ✨ Transcribe a Recipe
                </button>
              </div>
            ) : (
              <div className="grid-2">
                {recipes.map(r => (
                  <RecipeCard key={r.id} recipe={r} onClick={() => setSelectedRecipe(r)} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "planner" && (
          <MealPlanner
            planner={planner}
            recipes={recipes}
            onAddEntry={handleAddPlannerEntry}
            onRemoveEntry={handleRemoveEntry}
            onRecipeClick={setSelectedRecipe}
          />
        )}

        {activeTab === "settings" && (
          <div className="stack stack-lg animate-in" style={{ maxWidth: 620 }}>
            <div>
              <h2>Settings</h2>
              <p className="text-sm text-muted" style={{ marginTop: "var(--sp-1)" }}>
                Manage your profile, calorie targets, and API configuration.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-4)" }}>🎯 Person A - Daily Targets</h3>
              <div className="stack stack-md">
                <div>
                  <label className="label">Daily Calories (kcal)</label>
                  <input className="input" type="number" value={editCalories}
                    onChange={e => setEditCalories(parseInt(e.target.value) || 0)} />
                </div>
                <div className="grid-3">
                  <div>
                    <label className="label">Protein (g)</label>
                    <input className="input" type="number" value={editProtein}
                      onChange={e => setEditProtein(parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="label">Carbs (g)</label>
                    <input className="input" type="number" value={editCarbs}
                      onChange={e => setEditCarbs(parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="label">Fat (g)</label>
                    <input className="input" type="number" value={editFat}
                      onChange={e => setEditFat(parseInt(e.target.value) || 0)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-4)" }}>🎯 Person B (Person 2) - Daily Targets</h3>
              {person2Profile || edit2Calories > 0 ? (
                <div className="stack stack-md">
                  <div>
                    <label className="label">Daily Calories (kcal)</label>
                    <input className="input" type="number" value={edit2Calories}
                      onChange={e => setEdit2Calories(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="grid-3">
                    <div>
                      <label className="label">Protein (g)</label>
                      <input className="input" type="number" value={edit2Protein}
                        onChange={e => setEdit2Protein(parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="label">Carbs (g)</label>
                      <input className="input" type="number" value={edit2Carbs}
                        onChange={e => setEdit2Carbs(parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="label">Fat (g)</label>
                      <input className="input" type="number" value={edit2Fat}
                        onChange={e => setEdit2Fat(parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleUpdatePerson2Profile(null)}
                    style={{ color: "var(--coral)", alignSelf: "flex-start", marginTop: "var(--sp-2)", padding: 0 }}>
                    Remove Person 2 Profile
                  </button>
                </div>
              ) : (
                <div className="stack stack-sm">
                  <p className="text-xs text-muted">No profile set for Person 2 yet.</p>
                  <button className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start" }}
                    onClick={() => {
                      setEdit2Calories(1800);
                      setEdit2Protein(135);
                      setEdit2Carbs(200);
                      setEdit2Fat(50);
                    }}>
                    + Initialize Person 2 Targets
                  </button>
                </div>
              )}
            </div>

            <div className="card">
              <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-4)" }}>🤖 Gemini API Key</h3>
              <p className="text-xs text-muted" style={{ marginBottom: "var(--sp-3)" }}>
                Required for AI recipe transcription from URLs and text. Get your free key from{" "}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration: "underline", color: "var(--coral)", fontWeight: 600 }}>
                  Google AI Studio
                </a>.
              </p>
              <input className="input" type="password" placeholder="Enter your API key..."
                value={settingsApiKey}
                onChange={e => setSettingsApiKey(e.target.value)} />
            </div>

            <button className="btn btn-primary btn-lg" onClick={saveSettings}>
              Save Settings
            </button>

            <hr className="divider" />

            <button className="btn btn-ghost" onClick={onLogout}
              style={{ color: "var(--coral)", alignSelf: "flex-start", fontWeight: 600, padding: 0 }}>
              Reset Profile & Start Over
            </button>
          </div>
        )}
      </main>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          profile={profile}
          person2Profile={person2Profile}
          onUpdatePerson2Profile={handleUpdatePerson2Profile}
          onClose={() => setSelectedRecipe(null)}
          onAddToPlanner={handleAddToPlanner}
        />
      )}
    </div>
  );
}
