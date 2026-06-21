"use client";

import React, { useState, useMemo } from "react";
import type { Recipe, PlannerEntry } from "../types";
import { aggregateGroceryList } from "../services/groceryAggregator";

interface MealPlannerProps {
  planner: PlannerEntry[];
  recipes: Recipe[];
  onAddEntry: (entry: PlannerEntry) => void;
  onRemoveEntry: (week: number, day: number, slot: string) => void;
  onRecipeClick: (recipe: Recipe) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOTS: ("breakfast" | "lunch" | "dinner")[] = ["breakfast", "lunch", "dinner"];
const SLOT_LABELS: Record<string, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };

export default function MealPlanner({
  planner,
  recipes,
  onAddEntry,
  onRemoveEntry,
  onRecipeClick
}: MealPlannerProps) {
  const [activeWeek, setActiveWeek] = useState(1);
  const [pickerOpen, setPickerOpen] = useState<{ day: number; slot: "breakfast" | "lunch" | "dinner" } | null>(null);
  const [showGrocery, setShowGrocery] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const weekEntries = useMemo(() => {
    return planner.filter(e => e.week === activeWeek);
  }, [planner, activeWeek]);

  const getEntry = (day: number, slot: string) =>
    weekEntries.find(e => e.day === day && e.slot === slot);

  // Aggregate grocery list (delegated to groceryAggregator service)
  const groceryList = useMemo(() => {
    return aggregateGroceryList(weekEntries);
  }, [weekEntries]);

  const toggleCheck = (name: string) => {
    const next = new Set(checkedItems);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setCheckedItems(next);
  };

  const copyGroceryList = () => {
    const lines: string[] = [];
    Object.entries(groceryList).forEach(([cat, items]) => {
      lines.push(`\n${cat.toUpperCase()}`);
      items.forEach(i => lines.push(`  ${i.name}: ${i.amount} ${i.unit}`));
    });
    navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
  };

  // Weekly calorie summary
  const weeklyCalories = weekEntries.reduce((sum, e) => sum + (e.recipe.totalCalories || 0), 0);

  return (
    <div className="stack stack-lg animate-in">
      <div className="row row-between row-wrap" style={{ gap: "var(--sp-3)" }}>
        <div>
          <h2>Meal Planner</h2>
          <p className="text-sm text-muted" style={{ marginTop: "var(--sp-1)" }}>
            Plan your meals for each week and auto-generate your grocery list.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowGrocery(!showGrocery)}>
          🛒 {showGrocery ? "Hide List" : "Grocery List"}
        </button>
      </div>

      {/* Week selector */}
      <div className="chip-row">
        {[1, 2, 3, 4].map(w => (
          <button key={w}
            className={`chip ${activeWeek === w ? "chip--active" : ""}`}
            onClick={() => setActiveWeek(w)}
          >
            Week {w}
          </button>
        ))}
      </div>

      {/* Weekly stats */}
      <div className="row row-md" style={{
        padding: "var(--sp-3) var(--sp-4)", background: "var(--bg-cream-dark)",
        borderRadius: "var(--radius-md)", border: "2px solid var(--espresso)"
      }}>
        <span className="text-sm text-muted">Week {activeWeek} total:</span>
        <span className="text-sm text-bold" style={{ color: "var(--coral)" }}>{weeklyCalories} kcal</span>
        <span className="text-sm text-muted">across {weekEntries.length} meals</span>
      </div>

      {/* Planner table — desktop */}
      <div className="card-flat hide-mobile" style={{ overflow: "auto", border: "2px solid var(--espresso)" }}>
        <table className="planner-table">
          <thead>
            <tr>
              <th></th>
              {DAYS.map(d => <th key={d}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map(slot => (
              <tr key={slot}>
                <td>{SLOT_LABELS[slot]}</td>
                {DAYS.map((_, dayIdx) => {
                  const entry = getEntry(dayIdx, slot);
                  return (
                    <td key={dayIdx}>
                      {entry ? (
                        <div className="plan-filled" onClick={() => onRecipeClick(entry.recipe)}
                          style={{ cursor: "pointer" }}>
                          <div className="plan-filled-title">{entry.recipe.title}</div>
                          <div className="plan-filled-cal">{entry.recipe.totalCalories} kcal</div>
                          <button className="plan-filled-del"
                            onClick={(e) => { e.stopPropagation(); onRemoveEntry(activeWeek, dayIdx, slot); }}>✕</button>
                        </div>
                      ) : (
                        <button className="plan-slot"
                          onClick={() => setPickerOpen({ day: dayIdx, slot })}>
                          +
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Planner cards — mobile */}
      <div className="stack stack-md hide-desktop">
        {DAYS.map((day, dayIdx) => (
          <div key={day} className="card">
            <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--sp-3)" }}>{day}</h3>
            <div className="stack stack-sm">
              {SLOTS.map(slot => {
                const entry = getEntry(dayIdx, slot);
                return (
                  <div key={slot} className="row row-between" style={{
                    padding: "var(--sp-2) var(--sp-3)",
                    background: "rgba(43, 27, 20, 0.03)",
                    borderRadius: "var(--radius-sm)", border: "1.5px solid var(--espresso)"
                  }}>
                    <span className="text-xs uppercase text-muted text-bold" style={{ width: 75, color: "var(--espresso)" }}>
                      {SLOT_LABELS[slot]}
                    </span>
                    {entry ? (
                      <div className="row row-sm flex-1 row-between" onClick={() => onRecipeClick(entry.recipe)}
                        style={{ cursor: "pointer" }}>
                      <span className="text-sm text-bold" style={{ color: "var(--coral)" }}>{entry.recipe.title}</span>
                        <button className="btn-danger text-xs"
                          onClick={(e) => { e.stopPropagation(); onRemoveEntry(activeWeek, dayIdx, slot); }}>✕</button>
                      </div>
                    ) : (
                      <button className="btn btn-ghost btn-sm" style={{ color: "var(--coral)", fontWeight: 600, padding: 0 }}
                        onClick={() => setPickerOpen({ day: dayIdx, slot })}>
                        + Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Recipe picker modal */}
      {pickerOpen && (
        <div className="modal-overlay" onClick={() => setPickerOpen(null)}>
          <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "1.1rem", color: "var(--espresso)" }}>
                Pick a recipe — {DAYS[pickerOpen.day]}, {SLOT_LABELS[pickerOpen.slot]}
              </h3>
              <button className="btn-icon" onClick={() => setPickerOpen(null)}>✕</button>
            </div>
            <div className="modal-body">
              {recipes.length === 0 ? (
                <p className="text-sm text-muted text-center" style={{ padding: "var(--sp-8) 0" }}>
                  No saved recipes yet. Transcribe and save a recipe first!
                </p>
              ) : (
                <div className="stack stack-sm">
                  {recipes.map(r => (
                    <button key={r.id} className="row row-between w-full"
                      style={{
                        padding: "var(--sp-3) var(--sp-4)", border: "2px solid var(--espresso)",
                        borderRadius: "var(--radius-md)", background: "transparent", cursor: "pointer",
                        transition: "all 0.15s ease", textAlign: "left"
                      }}
                      onClick={() => {
                        onAddEntry({
                          week: activeWeek,
                          day: pickerOpen.day,
                          slot: pickerOpen.slot,
                          recipe: r,
                        });
                        setPickerOpen(null);
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "var(--bg-cream-dark)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      <div>
                        <div className="text-sm text-bold" style={{ color: "var(--espresso)" }}>{r.title}</div>
                        <div className="text-xs text-muted">{r.cookTime} • {r.difficulty}</div>
                      </div>
                      <span className="badge">{r.totalCalories} kcal</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grocery list panel */}
      {showGrocery && (
        <div className="card animate-up">
          <div className="row row-between" style={{ marginBottom: "var(--sp-4)", borderBottom: "2px solid var(--espresso)", paddingBottom: "var(--sp-2)" }}>
            <h3 style={{ fontSize: "1.2rem", color: "var(--espresso)" }}>🛒 Grocery List — Week {activeWeek}</h3>
            <button className="btn btn-secondary btn-sm" onClick={copyGroceryList}>
              📋 Copy to Clipboard
            </button>
          </div>

          {Object.keys(groceryList).length === 0 ? (
            <p className="text-sm text-muted text-center" style={{ padding: "var(--sp-6) 0" }}>
              Add meals to your planner to auto-generate a grocery list.
            </p>
          ) : (
            <div>
              {Object.entries(groceryList).map(([category, items]) => (
                <div key={category} style={{ marginBottom: "var(--sp-4)" }}>
                  <div className="grocery-category">{category}</div>
                  {items.map(item => {
                    const checked = checkedItems.has(item.name);
                    return (
                      <div key={item.name}
                        className={`grocery-item ${checked ? "grocery-item--checked" : ""}`}
                        onClick={() => toggleCheck(item.name)}
                      >
                        <span style={{ fontSize: "1.1rem", color: checked ? "var(--espresso-light)" : "var(--coral)" }}>
                          {checked ? "☑" : "☐"}
                        </span>
                        <span className="grocery-name">{item.name}</span>
                        <span className="grocery-amount">{item.amount} {item.unit}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
