export function calculateCalories(
  weight: number,
  height: number,
  age: number,
  gender: string,
  activity: string,
  goal: string
) {
  // Mifflin-St Jeor Equation
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += gender === "male" ? 5 : -161;

  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };
  let tdee = bmr * (multipliers[activity] || 1.2);

  if (goal === "lose") tdee -= 500;
  else if (goal === "gain") tdee += 400;

  const calories = Math.round(tdee);

  // Macro split based on goal
  let proteinPct = 0.30, fatPct = 0.25;
  if (goal === "gain") { proteinPct = 0.35; fatPct = 0.25; }
  if (goal === "lose") { proteinPct = 0.35; fatPct = 0.30; }
  const carbPct = 1 - proteinPct - fatPct;

  return {
    calories: Math.max(1000, calories),
    protein: Math.max(0, Math.round((calories * proteinPct) / 4)),
    carbs: Math.max(0, Math.round((calories * carbPct) / 4)),
    fat: Math.max(0, Math.round((calories * fatPct) / 9)),
  };
}
