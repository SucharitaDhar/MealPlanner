import React from "react";
import type { Recipe } from "../types";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  // Prefer AI generated illustration image, fall back to video thumbnail if available
  const imageSrc = recipe.imageUrl || recipe.thumbnailUrl;

  return (
    <div className="card-flat card-hover recipe-card" onClick={onClick}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={recipe.title}
          className="recipe-card-img"
          style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div className="recipe-card-img" style={{
          background: "linear-gradient(135deg, var(--bg-cream-dark) 0%, var(--mustard) 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--espresso)", fontSize: "2.5rem", height: "180px", borderBottom: "2px solid var(--espresso)"
        }}>
          🍽️
        </div>
      )}
      <div className="recipe-card-body">
        <div className="recipe-card-title">{recipe.title}</div>
        <div className="recipe-card-desc">{recipe.description}</div>
        <div className="recipe-card-meta">
          <span>🕐 {recipe.cookTime}</span>
          <span>🔥 {recipe.totalCalories} kcal kcal</span>
          <span>💪 {recipe.totalProtein}g protein</span>
        </div>
      </div>
    </div>
  );
}
