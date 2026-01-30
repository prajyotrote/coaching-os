type MetricsInput = {
  gender: 'male' | 'female';
  age: number;
  heightCm: number;
  weightKg: number;
  activityMultiplier: number;
  smokes: boolean;
  drinks: boolean;
  conditions: string[];
};

export const calculateHealthMetrics = (input: MetricsInput) => {
  const { heightCm, weightKg, age, activityMultiplier, smokes, drinks } = input;

  // BMI
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let bmiCategory = 'Healthy';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
  else if (bmi >= 30) bmiCategory = 'Obese';

  // BMR (Mifflin-St Jeor – male default, tweak if needed)
  const bmr =
    10 * weightKg +
    6.25 * heightCm -
    5 * age +
    (input.gender === 'male' ? 5 : -161);

  const tdee = Math.round(bmr * activityMultiplier);

  // Protein target
  let proteinMultiplier = 1.8;
  if (smokes || drinks) proteinMultiplier += 0.2;

  const protein = Math.round(weightKg * proteinMultiplier);

  // Health score (simple baseline logic for now)
  let score = 100;
  if (smokes) score -= 10;
  if (drinks) score -= 5;
  if (bmi < 18.5 || bmi > 30) score -= 10;

  score = Math.max(0, Math.min(100, score));

  return {
    bmi,
    bmiCategory,
    bmr: Math.round(bmr),
    tdee,
    protein,
    score,
  };
};
