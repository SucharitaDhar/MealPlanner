"use client";

import React, { useState } from "react";
import { useAppState } from "../store/AppStateContext";
import { apiRepository } from "../data/apiRepository";
import type { Recipe } from "../types";
import { generateDemoRecipeId } from "../services/recipeParser";

/* ===== Demo recipes ===== */
const DEMO_RECIPES: Recipe[] = [
  {
    id: "demo-1",
    title: "Creamy Garlic Tuscan Chicken",
    description: "Sun-dried tomatoes and spinach in a rich garlic parmesan cream sauce over perfectly seared chicken thighs.",
    servings: 2,
    cookTime: "35 min",
    difficulty: "Medium",
    ingredients: [
      { name: "Chicken thighs", amount: 400, unit: "g", caloriesPerUnit: 2.15, proteinPerUnit: 0.26, carbsPerUnit: 0, fatPerUnit: 0.13, category: "Protein" },
      { name: "Heavy cream", amount: 120, unit: "ml", caloriesPerUnit: 3.4, proteinPerUnit: 0.021, carbsPerUnit: 0.028, fatPerUnit: 0.36, category: "Dairy" },
      { name: "Parmesan cheese", amount: 50, unit: "g", caloriesPerUnit: 4.31, proteinPerUnit: 0.358, carbsPerUnit: 0.036, fatPerUnit: 0.286, category: "Dairy" },
      { name: "Spinach", amount: 100, unit: "g", caloriesPerUnit: 0.23, proteinPerUnit: 0.029, carbsPerUnit: 0.036, fatPerUnit: 0.004, category: "Produce" },
      { name: "Sun-dried tomatoes", amount: 60, unit: "g", caloriesPerUnit: 2.58, proteinPerUnit: 0.144, carbsPerUnit: 0.554, fatPerUnit: 0.029, category: "Produce" },
      { name: "Garlic cloves", amount: 4, unit: "pcs", caloriesPerUnit: 4.5, proteinPerUnit: 0.2, carbsPerUnit: 1.0, fatPerUnit: 0.02, category: "Produce" },
      { name: "Olive oil", amount: 15, unit: "ml", caloriesPerUnit: 8.84, proteinPerUnit: 0, carbsPerUnit: 0, fatPerUnit: 1.0, category: "Pantry" },
      { name: "Italian seasoning", amount: 5, unit: "g", caloriesPerUnit: 2.5, proteinPerUnit: 0.09, carbsPerUnit: 0.5, fatPerUnit: 0.07, category: "Pantry" },
    ],
    steps: [
      "Pat chicken thighs dry with paper towels and season both sides with salt, pepper, and Italian seasoning.",
      "Heat olive oil in a large skillet over medium-high heat. Sear chicken for 5-6 minutes per side until golden and cooked through (165°F). Set aside.",
      "In the same skillet, sauté minced garlic for 30 seconds until fragrant.",
      "Add sun-dried tomatoes and cook for 1 minute.",
      "Reduce heat to medium-low. Pour in heavy cream and stir in parmesan cheese until the sauce is smooth and thickened, about 3-4 minutes.",
      "Fold in spinach and cook until wilted, about 2 minutes.",
      "Return chicken thighs to the skillet, spoon sauce over the top, and let simmer together for 2 minutes.",
      "Serve immediately with crusty bread, pasta, or steamed vegetables.",
    ],
    source: "Demo Recipe",
    sourceUrl: "",
    imageUrl: "https://image.pollinations.ai/prompt/minimalist%20hand-drawn%20cartoon%20food%20illustration%20of%20Creamy%20Garlic%20Tuscan%20Chicken?width=600&height=400&nologo=true&seed=1",
    totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0,
  },
  {
    id: "demo-2",
    title: "High-Protein Greek Chickpea Bowl",
    description: "A vibrant Mediterranean bowl loaded with spiced chickpeas, cucumber, feta, and a bright lemon-tahini dressing.",
    servings: 2,
    cookTime: "20 min",
    difficulty: "Easy",
    ingredients: [
      { name: "Chickpeas (cooked)", amount: 300, unit: "g", caloriesPerUnit: 1.64, proteinPerUnit: 0.089, carbsPerUnit: 0.274, fatPerUnit: 0.026, category: "Protein" },
      { name: "Quinoa (dry)", amount: 100, unit: "g", caloriesPerUnit: 3.68, proteinPerUnit: 0.143, carbsPerUnit: 0.641, fatPerUnit: 0.061, category: "Pantry" },
      { name: "Cucumber", amount: 150, unit: "g", caloriesPerUnit: 0.15, proteinPerUnit: 0.007, carbsPerUnit: 0.036, fatPerUnit: 0.001, category: "Produce" },
      { name: "Cherry tomatoes", amount: 120, unit: "g", caloriesPerUnit: 0.18, proteinPerUnit: 0.009, carbsPerUnit: 0.039, fatPerUnit: 0.002, category: "Produce" },
      { name: "Feta cheese", amount: 60, unit: "g", caloriesPerUnit: 2.64, proteinPerUnit: 0.142, carbsPerUnit: 0.041, fatPerUnit: 0.213, category: "Dairy" },
      { name: "Red onion", amount: 40, unit: "g", caloriesPerUnit: 0.40, proteinPerUnit: 0.011, carbsPerUnit: 0.093, fatPerUnit: 0.001, category: "Produce" },
      { name: "Tahini", amount: 30, unit: "g", caloriesPerUnit: 5.95, proteinPerUnit: 0.170, carbsPerUnit: 0.213, fatPerUnit: 0.536, category: "Pantry" },
      { name: "Lemon juice", amount: 30, unit: "ml", caloriesPerUnit: 0.22, proteinPerUnit: 0.004, carbsPerUnit: 0.069, fatPerUnit: 0.002, category: "Produce" },
      { name: "Olive oil", amount: 15, unit: "ml", caloriesPerUnit: 8.84, proteinPerUnit: 0, carbsPerUnit: 0, fatPerUnit: 1.0, category: "Pantry" },
    ],
    steps: [
      "Cook quinoa according to package directions (rinse first, 2:1 water ratio, simmer 15 min). Fluff with a fork.",
      "Drain and rinse chickpeas. Toss with olive oil, cumin, paprika, salt, and pepper. Roast at 400°F for 20 min or pan-fry until crispy.",
      "Dice cucumber, halve cherry tomatoes, thinly slice red onion.",
      "Make the dressing: whisk tahini, lemon juice, 2 tbsp warm water, a pinch of salt, and minced garlic until smooth.",
      "Assemble bowls: quinoa base, top with crispy chickpeas, cucumber, tomatoes, onion, and crumbled feta.",
      "Drizzle generously with lemon-tahini dressing. Serve immediately.",
    ],
    source: "Demo Recipe",
    sourceUrl: "",
    imageUrl: "https://image.pollinations.ai/prompt/minimalist%20hand-drawn%20cartoon%20food%20illustration%20of%20Greek%20Chickpea%20Bowl?width=600&height=400&nologo=true&seed=2",
    totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0,
  },
];

DEMO_RECIPES.forEach(r => {
  r.ingredients.forEach(i => {
    r.totalCalories += Math.round(i.amount * i.caloriesPerUnit);
    r.totalProtein += Math.round(i.amount * i.proteinPerUnit);
    r.totalCarbs += Math.round(i.amount * i.carbsPerUnit);
    r.totalFat += Math.round(i.amount * i.fatPerUnit);
  });
});

export default function RecipeTranscriber({ onSaveRecipe }: { onSaveRecipe: (recipe: Recipe) => void }) {
  const { apiKey } = useAppState();
  const [tab, setTab] = useState<"url" | "text">("url");
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [pasteTitle, setPasteTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Recipe | null>(null);

  const transcribeFromUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const recipe = await apiRepository.transcribeFromUrl(url, apiKey);
      setResult(recipe);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const transcribeFromText = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const recipe = await apiRepository.transcribeFromText(rawText, apiKey);
      setResult(recipe);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = (demo: Recipe) => {
    setResult({ ...demo, id: generateDemoRecipeId() });
    setError("");
  };

  /* ===== Direct save from pasted text ===== */
  const saveDirectlyFromText = () => {
    if (!rawText.trim() || !pasteTitle.trim()) return;

    const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
    const ingredientLines: string[] = [];
    const stepLines: string[] = [];
    let section: "unknown" | "ingredients" | "steps" = "unknown";

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.startsWith("ingredient")) { section = "ingredients"; continue; }
      if (lower.startsWith("step") || lower.startsWith("instruction") || lower.startsWith("method") || lower.startsWith("direction")) { section = "steps"; continue; }

      if (section === "steps" || /^\d+[\.\)\-]/.test(line)) {
        stepLines.push(line.replace(/^\d+[\.\)\-]\s*/, ""));
        section = "steps";
      } else {
        ingredientLines.push(line.replace(/^[\-\*•]\s*/, ""));
      }
    }

    // Parse simple ingredient amounts
    const parsedIngredients = ingredientLines.map(raw => {
      const match = raw.match(/^([\d\.]+)\s*(g|kg|ml|l|cup|cups|tbsp|tsp|oz|pcs|piece|pieces)?\s+(.+)/i);
      if (match) {
        return {
          name: match[3].trim(),
          amount: parseFloat(match[1]),
          unit: match[2] || "pcs",
          caloriesPerUnit: 0, proteinPerUnit: 0, carbsPerUnit: 0, fatPerUnit: 0,
          category: "Pantry",
        };
      }
      return {
        name: raw,
        amount: 1, unit: "pcs",
        caloriesPerUnit: 0, proteinPerUnit: 0, carbsPerUnit: 0, fatPerUnit: 0,
        category: "Pantry",
      };
    });

    const recipe: Recipe = {
      id: `paste-${Date.now()}`,
      title: pasteTitle.trim(),
      description: `Pasted recipe with ${parsedIngredients.length} ingredients`,
      servings: 1,
      cookTime: "—",
      difficulty: "—",
      ingredients: parsedIngredients,
      steps: stepLines.length > 0 ? stepLines : ["Follow the recipe as written."],
      source: "Pasted Text",
      sourceUrl: "",
      imageUrl: "",
      totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0,
    };

    onSaveRecipe(recipe);
    setRawText("");
    setPasteTitle("");
  };

  const handleSave = () => {
    if (result) {
      onSaveRecipe(result);
      setResult(null);
      setUrl("");
      setRawText("");
    }
  };

  return (
    <div className="stack stack-lg animate-in">
      <div>
        <h2>Transcribe a Recipe</h2>
        <p className="text-sm text-muted" style={{ marginTop: "var(--sp-1)" }}>
          Paste a YouTube or Instagram URL, or type a recipe directly.
        </p>
      </div>

      {/* Tab selector */}
      <div className="tab-bar">
        <button className={`tab-btn ${tab === "url" ? "tab-btn--active" : ""}`} onClick={() => setTab("url")}>
          🔗 URL
        </button>
        <button className={`tab-btn ${tab === "text" ? "tab-btn--active" : ""}`} onClick={() => setTab("text")}>
          ✍️ Paste Text
        </button>
      </div>

      {tab === "url" && (
        <div className="stack stack-md">
          <div className="row row-md">
            <input
              className="input flex-1"
              placeholder="Paste a YouTube or Instagram URL..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && transcribeFromUrl()}
            />
            <button
              className="btn btn-primary shrink-0"
              onClick={transcribeFromUrl}
              disabled={loading || !url.trim()}
              style={{ opacity: loading || !url.trim() ? 0.5 : 1 }}
            >
              {loading ? "Transcribing..." : "Transcribe →"}
            </button>
          </div>
          {!apiKey && (
            <p className="text-xs text-muted" style={{ color: "var(--coral)", fontWeight: 600 }}>
              💡 No API key? Try a demo recipe below, or add your Gemini API key in Settings.
            </p>
          )}
        </div>
      )}

      {tab === "text" && (
        <div className="stack stack-md">
          <input
            className="input"
            placeholder="Recipe title (e.g. Chicken Stir Fry)"
            value={pasteTitle}
            onChange={e => setPasteTitle(e.target.value)}
          />
          <textarea
            className="textarea"
            rows={8}
            placeholder={"Paste your full recipe here — ingredients, amounts, and steps.\n\nExample:\nIngredients:\n- 200g chicken breast\n- 1 tbsp olive oil\n- 2 cloves garlic\n\nSteps:\n1. Heat oil in a pan\n2. Cook chicken until golden"}
            value={rawText}
            onChange={e => setRawText(e.target.value)}
          />
          <div className="row row-md row-wrap">
            <button
              className="btn btn-primary"
              onClick={saveDirectlyFromText}
              disabled={!rawText.trim() || !pasteTitle.trim()}
              style={{ opacity: !rawText.trim() || !pasteTitle.trim() ? 0.5 : 1 }}
            >
              💾 Save to Library
            </button>
            {apiKey && (
              <button
                className="btn btn-secondary"
                onClick={transcribeFromText}
                disabled={loading || !rawText.trim()}
                style={{ opacity: loading || !rawText.trim() ? 0.5 : 1 }}
              >
                {loading ? "Transcribing..." : "✨ Transcribe with AI instead"}
              </button>
            )}
          </div>
          {!apiKey && (
            <p className="text-xs text-muted">
              💡 Want AI to auto-parse ingredients and calories? Add your Gemini API key in Settings.
            </p>
          )}
        </div>
      )}

      {/* Demo links */}
      <div className="stack stack-sm" style={{ padding: "var(--sp-2) 0" }}>
        <span className="text-xs uppercase text-muted text-bold">Or try a demo recipe:</span>
        <div className="row row-sm row-wrap">
          {DEMO_RECIPES.map(d => (
            <button key={d.id} className="chip" onClick={() => loadDemo(d)}>
              {d.title}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="row row-center" style={{ padding: "var(--sp-10) 0" }}>
          <div className="stack" style={{ alignItems: "center", gap: "var(--sp-4)" }}>
            <div className="spinner" />
            <p className="text-sm text-muted">Analyzing recipe content with AI…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="card animate-up">
          <div className="row row-between" style={{ marginBottom: "var(--sp-4)" }}>
            <div>
              <h3>{result.title}</h3>
              <p className="text-sm text-muted" style={{ marginTop: "var(--sp-1)" }}>
                {result.description}
              </p>
            </div>
            {result.source !== "Demo Recipe" && (
              <span className="badge">{result.source}</span>
            )}
          </div>

          <div className="row row-md" style={{ marginBottom: "var(--sp-4)" }}>
            <span className="badge">🕐 {result.cookTime}</span>
            <span className="badge">🍽️ {result.servings} servings</span>
            <span className="badge">📊 {result.difficulty}</span>
          </div>

          {/* Image preview */}
          {result.imageUrl && (
            <div style={{ width: "100%", borderRadius: "var(--radius-md)", overflow: "hidden", border: "2px solid var(--espresso)", marginBottom: "var(--sp-4)" }}>
              <img src={result.imageUrl} alt={result.title} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
            </div>
          )}

          <div className="row row-md" style={{
            padding: "var(--sp-4)", background: "var(--bg-cream-dark)",
            borderRadius: "var(--radius-md)", marginBottom: "var(--sp-5)", border: "2px solid var(--espresso)"
          }}>
            <div className="flex-1 text-center">
              <div className="text-bold" style={{ fontSize: "1.1rem" }}>{result.totalCalories}</div>
              <div className="text-xxs uppercase text-muted">Calories</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-bold" style={{ fontSize: "1.1rem" }}>{result.totalProtein}g</div>
              <div className="text-xxs uppercase text-muted">Protein</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-bold" style={{ fontSize: "1.1rem" }}>{result.totalCarbs}g</div>
              <div className="text-xxs uppercase text-muted">Carbs</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-bold" style={{ fontSize: "1.1rem" }}>{result.totalFat}g</div>
              <div className="text-xxs uppercase text-muted">Fat</div>
            </div>
          </div>

          <hr className="divider" />

          {/* Ingredients */}
          <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-3)" }}>Ingredients</h3>
          <div className="stack stack-sm" style={{ marginBottom: "var(--sp-5)" }}>
            {result.ingredients.map((ing, i) => (
              <div key={i} className="row row-between" style={{
                padding: "var(--sp-2) var(--sp-3)",
                background: i % 2 === 0 ? "rgba(43, 27, 20, 0.03)" : "transparent",
                borderRadius: "var(--radius-sm)"
              }}>
                <span className="text-sm">{ing.name}</span>
                <span className="text-sm text-bold">
                  {ing.amount} {ing.unit}
                  <span className="text-muted" style={{ marginLeft: "var(--sp-2)" }}>
                    ({Math.round(ing.amount * ing.caloriesPerUnit)} cal)
                  </span>
                </span>
              </div>
            ))}
          </div>

          <hr className="divider" />

          {/* Steps */}
          <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-3)" }}>Instructions</h3>
          <div className="stack stack-md" style={{ marginBottom: "var(--sp-5)" }}>
            {result.steps.map((step, i) => (
              <div key={i} className="row row-md" style={{ alignItems: "flex-start" }}>
                <div className="step-num">{i + 1}</div>
                <p className="text-sm flex-1" style={{ lineHeight: 1.6 }}>{step}</p>
              </div>
            ))}
          </div>

          <hr className="divider" />

          <button className="btn btn-primary btn-full btn-lg" onClick={handleSave}>
            Save Recipe to Library
          </button>
        </div>
      )}
    </div>
  );
}
