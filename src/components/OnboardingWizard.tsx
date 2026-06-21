"use client";

import React, { useState } from "react";
import type { UserProfile } from "../types";
import { calculateCalories } from "../services/calorieCalculator";

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
  onBackToLanding?: () => void;
}

export default function OnboardingWizard({ onComplete, onBackToLanding }: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    weight: "70", height: "170", age: "28",
    gender: "female" as "male" | "female",
    activityLevel: "moderate" as "sedentary" | "light" | "moderate" | "active",
    goal: "maintain" as "lose" | "maintain" | "gain",
  });
  const [result, setResult] = useState({
    calories: 2100, protein: 158, carbs: 236, fat: 58,
  });

  const handleCalculate = () => {
    const r = calculateCalories(
      parseFloat(form.weight) || 70,
      parseFloat(form.height) || 170,
      parseFloat(form.age) || 28,
      form.gender,
      form.activityLevel,
      form.goal
    );
    setResult(r);
    setStep(2);
  };

  const handleSkip = () => {
    setResult({ calories: 2000, protein: 150, carbs: 200, fat: 65 });
    setStep(2);
  };

  const handleFinish = () => {
    if (result.calories <= 0) return;
    onComplete({
      ...form,
      ...result,
      apiKey: "",
    });
  };

  return (
    <div className="onboarding" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg-cream)", padding: "var(--sp-6)" }}>
      {/* Header Back Button */}
      <div style={{ width: "100%", maxWidth: "520px", display: "flex", justifyContent: "flex-start", marginBottom: "var(--sp-4)" }}>
        <button className="skip-link" onClick={onBackToLanding} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "var(--sp-1)" }}>
          ← Back to home
        </button>
      </div>

      <div className="onboarding-card card" style={{ width: "100%", maxWidth: "520px", background: "var(--white)" }}>
        <div className="onboarding-logo" style={{ marginBottom: "var(--sp-4)" }}>Forka</div>

        {step === 1 && (
          <div className="animate-up stack stack-lg">
            <div>
              <h3 className="text-center" style={{ marginBottom: "var(--sp-2)", fontSize: "1.6rem" }}>
                Calculate Daily Targets
              </h3>
              <p className="onboarding-subtitle" style={{ marginBottom: 0 }}>
                Tell us about yourself so we can calculate your ideal daily calorie and macro goals.
              </p>
            </div>

            <div className="stack stack-md">
              <div className="grid-2">
                <div>
                  <label className="label">Weight (kg)</label>
                  <input
                    className="input" type="number" value={form.weight}
                    onChange={e => setForm({ ...form, weight: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Height (cm)</label>
                  <input
                    className="input" type="number" value={form.height}
                    onChange={e => setForm({ ...form, height: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label className="label">Age</label>
                  <input
                    className="input" type="number" value={form.age}
                    onChange={e => setForm({ ...form, age: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select
                    className="input select" value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value as "male" | "female" })}
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Activity Level</label>
                <select
                  className="input select" value={form.activityLevel}
                  onChange={e => setForm({ ...form, activityLevel: e.target.value as "sedentary" | "light" | "moderate" | "active" })}
                >
                  <option value="sedentary">Sedentary — desk job, no exercise</option>
                  <option value="light">Light — exercise 1-2 days/week</option>
                  <option value="moderate">Moderate — exercise 3-5 days/week</option>
                  <option value="active">Active — exercise 6-7 days/week</option>
                </select>
              </div>

              <div>
                <label className="label">Goal</label>
                <div className="chip-row">
                  {(["lose", "maintain", "gain"] as const).map(g => (
                    <button
                      key={g} type="button"
                      className={`chip ${form.goal === g ? "chip--active" : ""}`}
                      onClick={() => setForm({ ...form, goal: g })}
                    >
                      {g === "lose" ? "🔥 Lose Weight" : g === "maintain" ? "⚖️ Maintain" : "💪 Build Muscle"}
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-lg btn-full" onClick={handleCalculate} style={{ marginTop: "var(--sp-4)" }}>
                Calculate My Calories →
              </button>

              <div className="text-center" style={{ marginTop: "var(--sp-2)" }}>
                <button className="skip-link" onClick={handleSkip}>
                  Skip — Enter targets directly
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-up stack stack-lg">
            <div>
              <h3 className="text-center" style={{ marginBottom: "var(--sp-2)", fontSize: "1.6rem" }}>
                Confirm Daily Goals
              </h3>
              <p className="onboarding-subtitle" style={{ marginBottom: 0 }}>
                Here are your recommended daily targets. Customize them to your liking.
              </p>
            </div>

            <div className="stack stack-lg">
              <div className="result-card stack stack-md" style={{ background: "var(--bg-cream)", border: "2px solid var(--espresso)", boxShadow: "none" }}>
                <div>
                  <label className="label" style={{ color: "var(--espresso)" }}>Daily Calories (kcal)</label>
                  <input
                    className="input" type="number" value={result.calories || ""}
                    onChange={e => setResult({ ...result, calories: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 2100"
                    style={{ fontSize: "1.6rem", fontWeight: 700, textAlign: "center", fontFamily: "var(--font-display)", border: "2px solid var(--espresso)" }}
                  />
                </div>

                <div className="macro-bar">
                  <div className="macro-item">
                    <input
                      className="input input-sm" type="number"
                      value={result.protein || ""} placeholder="g"
                      onChange={e => setResult({ ...result, protein: parseInt(e.target.value) || 0 })}
                      style={{ textAlign: "center", fontWeight: 700, fontSize: "1.1rem", border: "2px solid var(--espresso)", background: "#ffffff" }}
                    />
                    <div className="macro-label">Protein (g)</div>
                  </div>
                  <div className="macro-item">
                    <input
                      className="input input-sm" type="number"
                      value={result.carbs || ""} placeholder="g"
                      onChange={e => setResult({ ...result, carbs: parseInt(e.target.value) || 0 })}
                      style={{ textAlign: "center", fontWeight: 700, fontSize: "1.1rem", border: "2px solid var(--espresso)", background: "#ffffff" }}
                    />
                    <div className="macro-label">Carbs (g)</div>
                  </div>
                  <div className="macro-item">
                    <input
                      className="input input-sm" type="number"
                      value={result.fat || ""} placeholder="g"
                      onChange={e => setResult({ ...result, fat: parseInt(e.target.value) || 0 })}
                      style={{ textAlign: "center", fontWeight: 700, fontSize: "1.1rem", border: "2px solid var(--espresso)", background: "#ffffff" }}
                    />
                    <div className="macro-label">Fat (g)</div>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg btn-full"
                onClick={handleFinish}
                disabled={result.calories <= 0}
                style={{ opacity: result.calories > 0 ? 1 : 0.4 }}
              >
                Let&apos;s Start Cooking →
              </button>

              <div className="text-center">
                <button className="skip-link" onClick={() => setStep(1)}>
                  ← Back to metrics
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
