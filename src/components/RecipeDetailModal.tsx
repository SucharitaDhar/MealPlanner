"use client";

import React, { useState, useMemo, useEffect, startTransition } from "react";
import type { Recipe, Person2Profile, MealSlot, UserProfile } from "../types";
import { calculateCalories } from "../services/calorieCalculator";
import { scaleRecipe, calculatePortionSplit } from "../services/portionSplitting";

interface RecipeDetailModalProps {
  recipe: Recipe;
  profile: UserProfile;
  person2Profile: Person2Profile | null;
  onUpdatePerson2Profile: (profile: Person2Profile | null) => void;
  onClose: () => void;
  onAddToPlanner: (recipe: Recipe, slot: MealSlot) => void;
}

export default function RecipeDetailModal({
  recipe,
  profile,
  person2Profile,
  onUpdatePerson2Profile,
  onClose,
  onAddToPlanner
}: RecipeDetailModalProps) {
  const [personCount, setPersonCount] = useState<1 | 2>(1);
  const [calA, setCalA] = useState(Math.round((profile?.calories || 2000) / 3));
  const [calB, setCalB] = useState(() => {
    return person2Profile ? Math.round(person2Profile.calories / 3) : Math.round((profile?.calories || 2000) / 3);
  });
  const [cookedWeight, setCookedWeight] = useState("");
  const [showPlanner, setShowPlanner] = useState(false);
  const [planWeek, setPlanWeek] = useState(1);
  const [planDay, setPlanDay] = useState(0);
  const [planSlot, setPlanSlot] = useState<"breakfast" | "lunch" | "dinner">("lunch");

  // Person 2 Setup Form states
  const [isEditingPerson2, setIsEditingPerson2] = useState(false);
  const [setupMethod, setSetupMethod] = useState<"metrics" | "direct">("metrics");
  const [p2Weight, setP2Weight] = useState(person2Profile?.weight || "70");
  const [p2Height, setP2Height] = useState(person2Profile?.height || "170");
  const [p2Age, setP2Age] = useState(person2Profile?.age || "28");
  const [p2Gender, setP2Gender] = useState<"male" | "female">(person2Profile?.gender || "female");
  const [p2Activity, setP2Activity] = useState<"sedentary" | "light" | "moderate" | "active">(person2Profile?.activityLevel || "moderate");
  const [p2Goal, setP2Goal] = useState<"lose" | "maintain" | "gain">(person2Profile?.goal || "maintain");
  const [p2Calories, setP2Calories] = useState(person2Profile?.calories || 1800);
  const [p2Protein, setP2Protein] = useState(person2Profile?.protein || 135);
  const [p2Carbs, setP2Carbs] = useState(person2Profile?.carbs || 200);
  const [p2Fat, setP2Fat] = useState(person2Profile?.fat || 50);

  useEffect(() => {
    if (person2Profile) {
      startTransition(() => {
        setCalB(Math.round(person2Profile.calories / 3));
        setP2Weight(person2Profile.weight || "70");
        setP2Height(person2Profile.height || "170");
        setP2Age(person2Profile.age || "28");
        setP2Gender(person2Profile.gender || "female");
        setP2Activity(person2Profile.activityLevel || "moderate");
        setP2Goal(person2Profile.goal || "maintain");
        setP2Calories(person2Profile.calories);
        setP2Protein(person2Profile.protein);
        setP2Carbs(person2Profile.carbs);
        setP2Fat(person2Profile.fat);
      });
    }
  }, [person2Profile]);

  const handleSavePerson2 = () => {
    let newProfile: Person2Profile;
    if (setupMethod === "metrics") {
      const calculated = calculateCalories(
        parseFloat(p2Weight) || 70,
        parseFloat(p2Height) || 170,
        parseFloat(p2Age) || 28,
        p2Gender,
        p2Activity,
        p2Goal
      );
      newProfile = {
        weight: p2Weight,
        height: p2Height,
        age: p2Age,
        gender: p2Gender,
        activityLevel: p2Activity,
        goal: p2Goal,
        ...calculated
      };
    } else {
      newProfile = {
        weight: "",
        height: "",
        age: "",
        gender: "female",
        activityLevel: "sedentary",
        goal: "maintain",
        calories: p2Calories,
        protein: p2Protein,
        carbs: p2Carbs,
        fat: p2Fat
      };
    }
    onUpdatePerson2Profile(newProfile);
    setIsEditingPerson2(false);
  };

  // Calculate scaled recipe (delegated to portionSplitting service)
  const scaled = useMemo(() => {
    const targetCal = personCount === 1 ? calA : calA + calB;
    return scaleRecipe(recipe, targetCal);
  }, [recipe, calA, calB, personCount]);

  // Portion split for 2 people (delegated to portionSplitting service)
  const split = useMemo(() => {
    return calculatePortionSplit(scaled.totalCal, calA, calB, cookedWeight);
  }, [calA, calB, cookedWeight, scaled.totalCal]);

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleAddToPlanner = () => {
    onAddToPlanner(
      {
        ...recipe,
        totalCalories: scaled.totalCal,
        totalProtein: scaled.totalP,
        totalCarbs: scaled.totalC,
        totalFat: scaled.totalF,
        ingredients: scaled.ingredients
      },
      { week: planWeek, day: planDay, slot: planSlot }
    );
    onClose();
  };

  const imageSrc = recipe.imageUrl || recipe.thumbnailUrl;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: "1.65rem", color: "var(--espresso)" }}>{recipe.title}</h2>
            <p className="text-sm text-muted">{recipe.description}</p>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: "1.4rem", color: "var(--espresso)" }}>✕</button>
        </div>

        <div className="modal-body">
          <div className="stack stack-lg">
            
            {/* Image banner */}
            {imageSrc && (
              <div style={{ width: "100%", height: "260px", borderRadius: "var(--radius-md)", overflow: "hidden", border: "2px solid var(--espresso)", position: "relative" }}>
                <img src={imageSrc} alt={recipe.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}

            {/* Meta badges */}
            <div className="row row-md row-wrap">
              <span className="badge">🕐 {recipe.cookTime}</span>
              <span className="badge">🍽️ {recipe.servings} servings</span>
              <span className="badge">📊 {recipe.difficulty}</span>
              {recipe.source !== "Demo Recipe" && <span className="badge">📥 {recipe.source}</span>}
            </div>

            <hr className="divider" />

            {/* === Calorie Customizer === */}
            <div className="card" style={{ background: "var(--bg-cream-dark)" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-4)" }}>🎯 Calorie Customizer</h3>

              {/* Person toggle */}
              <div className="row row-md" style={{ marginBottom: "var(--sp-4)" }}>
                <button
                  className={`chip ${personCount === 1 ? "chip--active" : ""}`}
                  onClick={() => setPersonCount(1)}
                >
                  👤 1 Person
                </button>
                <button
                  className={`chip ${personCount === 2 ? "chip--active" : ""}`}
                  onClick={() => setPersonCount(2)}
                >
                  👥 2 People
                </button>
              </div>

              {personCount === 1 && (
                <div className="stack stack-sm">
                  <label className="label">Target Calories for this meal</label>
                  <input
                    className="input" type="number" value={calA}
                    onChange={e => setCalA(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted" style={{ color: "var(--espresso-muted)" }}>
                    Your daily target is {profile?.calories} kcal — this is ~{Math.round((calA / (profile?.calories || 2000)) * 100)}% of your daily intake.
                  </p>
                </div>
              )}

              {personCount === 2 && (!person2Profile || isEditingPerson2) && (
                <div className="card-flat animate-in" style={{ border: "2px solid var(--espresso)", padding: "var(--sp-4)", background: "#ffffff", borderRadius: "var(--radius-md)" }}>
                  <div className="row row-between" style={{ marginBottom: "var(--sp-4)" }}>
                    <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--espresso)" }}>👥 Set Up Person 2&apos;s Profile</h4>
                    {person2Profile && (
                      <button className="skip-link" onClick={() => setIsEditingPerson2(false)} style={{ textDecoration: "none", fontSize: "0.75rem", color: "var(--coral)" }}>
                        Cancel
                      </button>
                    )}
                  </div>

                  {/* Setup Method Tab */}
                  <div className="chip-row" style={{ marginBottom: "var(--sp-4)" }}>
                    <button type="button" className={`chip ${setupMethod === "metrics" ? "chip--active" : ""}`} onClick={() => setSetupMethod("metrics")}>
                      Calculate from Metrics
                    </button>
                    <button type="button" className={`chip ${setupMethod === "direct" ? "chip--active" : ""}`} onClick={() => setSetupMethod("direct")}>
                      Enter Targets Directly
                    </button>
                  </div>

                  {setupMethod === "metrics" ? (
                    <div className="stack stack-md animate-in">
                      <div className="grid-2">
                        <div>
                          <label className="label">Weight (kg)</label>
                          <input className="input input-sm" type="number" value={p2Weight} onChange={e => setP2Weight(e.target.value)} />
                        </div>
                        <div>
                          <label className="label">Height (cm)</label>
                          <input className="input input-sm" type="number" value={p2Height} onChange={e => setP2Height(e.target.value)} />
                        </div>
                      </div>
                      <div className="grid-2">
                        <div>
                          <label className="label">Age</label>
                          <input className="input input-sm" type="number" value={p2Age} onChange={e => setP2Age(e.target.value)} />
                        </div>
                        <div>
                          <label className="label">Gender</label>
                          <select className="input select input-sm" value={p2Gender} onChange={e => setP2Gender(e.target.value as "male" | "female")}>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="label">Activity Level</label>
                        <select className="input select input-sm" value={p2Activity} onChange={e => setP2Activity(e.target.value as "sedentary" | "light" | "moderate" | "active")}>
                          <option value="sedentary">Sedentary — desk job</option>
                          <option value="light">Light — exercise 1-2 days/week</option>
                          <option value="moderate">Moderate — exercise 3-5 days/week</option>
                          <option value="active">Active — exercise 6-7 days/week</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Goal</label>
                        <div className="chip-row">
                          {(["lose", "maintain", "gain"] as const).map(g => (
                            <button key={g} type="button" className={`chip ${p2Goal === g ? "chip--active" : ""}`} onClick={() => setP2Goal(g)}>
                              {g === "lose" ? "🔥 Lose" : g === "maintain" ? "⚖️ Maintain" : "💪 Gain"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="stack stack-md animate-in">
                      <div>
                        <label className="label">Daily Calories (kcal)</label>
                        <input className="input input-sm" type="number" value={p2Calories} onChange={e => setP2Calories(parseInt(e.target.value) || 0)} />
                      </div>
                      <div className="grid-3">
                        <div>
                          <label className="label">Protein (g)</label>
                          <input className="input input-sm" type="number" value={p2Protein} onChange={e => setP2Protein(parseInt(e.target.value) || 0)} />
                        </div>
                        <div>
                          <label className="label">Carbs (g)</label>
                          <input className="input input-sm" type="number" value={p2Carbs} onChange={e => setP2Carbs(parseInt(e.target.value) || 0)} />
                        </div>
                        <div>
                          <label className="label">Fat (g)</label>
                          <input className="input input-sm" type="number" value={p2Fat} onChange={e => setP2Fat(parseInt(e.target.value) || 0)} />
                        </div>
                      </div>
                    </div>
                  )}

                  <button className="btn btn-primary btn-full btn-sm" style={{ marginTop: "var(--sp-4)" }} onClick={handleSavePerson2}>
                    Save Person 2 Targets & Continue
                  </button>
                </div>
              )}

              {personCount === 2 && person2Profile && !isEditingPerson2 && (
                <div className="stack stack-md animate-in">
                  <div className="grid-2">
                    <div>
                      <label className="label">Person A (kcal)</label>
                      <input className="input" type="number" value={calA}
                        onChange={e => setCalA(parseInt(e.target.value) || 0)} />
                      <span className="text-xxs text-muted">Daily target: {profile?.calories} kcal</span>
                    </div>
                    <div>
                      <label className="label">Person B (kcal)</label>
                      <input className="input" type="number" value={calB}
                        onChange={e => setCalB(parseInt(e.target.value) || 0)} />
                      <span className="text-xxs text-muted">Daily target: {person2Profile.calories} kcal</span>
                    </div>
                  </div>

                  {split && (
                    <div className="stack stack-sm">
                      {/* Portion split bar */}
                      <div className="split-bar">
                        <div className="split-bar-a" style={{ width: `${split.pctA}%` }} />
                        <div className="split-bar-b" style={{ width: `${split.pctB}%` }} />
                      </div>
                      <div className="row row-between text-xs text-bold">
                        <span>Person A: <strong style={{ color: "var(--coral)" }}>{split.pctA}%</strong> ({split.calA} kcal)</span>
                        <span>Person B: <strong style={{ color: "var(--coral)" }}>{split.pctB}%</strong> ({split.calB} kcal)</span>
                      </div>

                      {/* Cooked weight splitter */}
                      <div style={{ marginTop: "var(--sp-3)" }}>
                        <label className="label">Total Cooked Weight (g) — optional</label>
                        <input
                          className="input" type="number" placeholder="e.g. 800"
                          value={cookedWeight}
                          onChange={e => setCookedWeight(e.target.value)}
                        />
                      </div>
                      {split.gramsA !== null && split.gramsB !== null && (
                        <div className="row row-md" style={{
                          background: "#ffffff", borderRadius: "var(--radius-md)",
                          padding: "var(--sp-3) var(--sp-4)", border: "2px solid var(--espresso)"
                        }}>
                          <div className="flex-1 text-center">
                            <div className="text-bold" style={{ fontSize: "1.15rem", color: "var(--coral)" }}>{split.gramsA}g</div>
                            <div className="text-xxs uppercase text-muted">Person A</div>
                          </div>
                          <div style={{ width: 2, height: 32, background: "var(--espresso)" }} />
                          <div className="flex-1 text-center">
                            <div className="text-bold" style={{ fontSize: "1.15rem", color: "var(--mustard)" }}>{split.gramsB}g</div>
                            <div className="text-xxs uppercase text-muted">Person B</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ textAlign: "right", marginTop: "var(--sp-2)" }}>
                    <button className="skip-link" onClick={() => setIsEditingPerson2(true)} style={{ textDecoration: "none", fontSize: "0.8rem", color: "var(--coral)" }}>
                      ✏️ Edit Person 2 Profile / Targets
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* === Macro totals === */}
            <div className="stack stack-sm" style={{
              padding: "var(--sp-4)", background: "var(--bg-cream-dark)",
              borderRadius: "var(--radius-md)", border: "2px solid var(--espresso)"
            }}>
              <div style={{ textAlign: "center", borderBottom: "2px dashed var(--espresso-thin)", paddingBottom: "var(--sp-2)", marginBottom: "var(--sp-1)" }}>
                <span className="text-xxs uppercase text-muted text-bold" style={{ color: "var(--espresso)" }}>Total Recipe Nutrition</span>
              </div>
              <div className="row row-md">
                <div className="flex-1 text-center">
                  <div className="text-bold" style={{ fontSize: "1.2rem" }}>{scaled.totalCal}</div>
                  <div className="text-xxs uppercase text-muted">Calories</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-bold" style={{ fontSize: "1.2rem" }}>{scaled.totalP}g</div>
                  <div className="text-xxs uppercase text-muted">Protein</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-bold" style={{ fontSize: "1.2rem" }}>{scaled.totalC}g</div>
                  <div className="text-xxs uppercase text-muted">Carbs</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-bold" style={{ fontSize: "1.2rem" }}>{scaled.totalF}g</div>
                  <div className="text-xxs uppercase text-muted">Fat</div>
                </div>
              </div>

              {personCount === 2 && split && (
                <div className="animate-in" style={{ borderTop: "2px dashed var(--espresso-thin)", paddingTop: "var(--sp-3)", marginTop: "var(--sp-2)" }}>
                  <div className="grid-2">
                    <div style={{ borderRight: "2px dashed var(--espresso-thin)", paddingRight: "var(--sp-3)" }}>
                      <div className="text-xxs uppercase text-muted text-bold" style={{ marginBottom: "var(--sp-1)", color: "var(--coral)" }}>Person A ({split.pctA}%)</div>
                      <div className="row row-between text-xs">
                        <span>Cal: <strong>{split.calA}</strong></span>
                        <span>P: <strong>{Math.round(scaled.totalP * (split.pctA / 100))}g</strong></span>
                        <span>C: <strong>{Math.round(scaled.totalC * (split.pctA / 100))}g</strong></span>
                        <span>F: <strong>{Math.round(scaled.totalF * (split.pctA / 100))}g</strong></span>
                      </div>
                    </div>
                    <div style={{ paddingLeft: "var(--sp-3)" }}>
                      <div className="text-xxs uppercase text-muted text-bold" style={{ marginBottom: "var(--sp-1)", color: "var(--espresso)" }}>Person B ({split.pctB}%)</div>
                      <div className="row row-between text-xs">
                        <span>Cal: <strong>{split.calB}</strong></span>
                        <span>P: <strong>{Math.round(scaled.totalP * (split.pctB / 100))}g</strong></span>
                        <span>C: <strong>{Math.round(scaled.totalC * (split.pctB / 100))}g</strong></span>
                        <span>F: <strong>{Math.round(scaled.totalF * (split.pctB / 100))}g</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr className="divider" />

            {/* === Scaled Ingredients === */}
            <div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-3)" }}>Scaled Ingredients</h3>
              <div className="stack stack-sm">
                {scaled.ingredients.map((ing, i) => (
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
            </div>

            <hr className="divider" />

            {/* === Steps === */}
            <div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-3)" }}>Instructions</h3>
              <div className="stack stack-md">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="row row-md" style={{ alignItems: "flex-start" }}>
                    <div className="step-num">{i + 1}</div>
                    <p className="text-sm flex-1" style={{ lineHeight: 1.6 }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="divider" />

            {/* === Add to Planner === */}
            {!showPlanner ? (
              <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowPlanner(true)}>
                Add to Meal Planner
              </button>
            ) : (
              <div className="card animate-up" style={{ background: "var(--bg-cream-dark)" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-4)" }}>📅 Add to Meal Planner</h3>
                <div className="stack stack-md">
                  <div className="grid-3">
                    <div>
                      <label className="label">Week</label>
                      <select className="input select" value={planWeek}
                        onChange={e => setPlanWeek(parseInt(e.target.value))}>
                        <option value={1}>Week 1</option>
                        <option value={2}>Week 2</option>
                        <option value={3}>Week 3</option>
                        <option value={4}>Week 4</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Day</label>
                      <select className="input select" value={planDay}
                        onChange={e => setPlanDay(parseInt(e.target.value))}>
                        {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Meal</label>
                      <select className="input select" value={planSlot}
                        onChange={e => setPlanSlot(e.target.value as "breakfast" | "lunch" | "dinner")}>
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-full" onClick={handleAddToPlanner}>
                    Confirm → Add to Week {planWeek}, {DAYS[planDay]}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
