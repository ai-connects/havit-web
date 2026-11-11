/**
 * Wellness calculators — pure formula helpers (no UI / no I/O).
 *
 * References:
 *   - BMR: Mifflin-St Jeor (1990), the most accurate non-DEXA equation
 *   - TDEE: BMR × PAL factor (WHO/IOM standard activity multipliers)
 *   - Protein: ISSN 2017 position stand on protein and exercise
 *   - Water: NAM 2004 adequate intake + activity adjustment
 */

export type Sex = 'male' | 'female';
export type Unit = 'metric' | 'imperial';

export interface BMRInput {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
}

export function bmrMifflinStJeor({ sex, weightKg, heightCm, age }: BMRInput): number {
  const s = sex === 'male' ? 5 : -161;
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + s);
}

export type ActivityLevel =
  | 'sedentary'    // desk job, little/no exercise
  | 'light'        // 1–3 days/week light exercise
  | 'moderate'     // 3–5 days/week moderate exercise
  | 'active'       // 6–7 days/week
  | 'very_active'; // 2×/day, heavy training or physical job

export const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function tdee(bmr: number, level: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIER[level]);
}

export type Goal = 'cut' | 'maintain' | 'bulk';
export const GOAL_CALORIE_DELTA: Record<Goal, number> = {
  cut: -500,        // ~0.5 kg/week loss
  maintain: 0,
  bulk: 300,        // ~0.25 kg/week gain (lean)
};

export function targetCalories(tdeeKcal: number, goal: Goal): number {
  return tdeeKcal + GOAL_CALORIE_DELTA[goal];
}

/* ─── unit conversion helpers ─── */
export const lbToKg = (lb: number) => lb * 0.45359237;
export const kgToLb = (kg: number) => kg / 0.45359237;
export const inToCm = (inch: number) => inch * 2.54;
export const ftInToCm = (ft: number, inch: number) => (ft * 12 + inch) * 2.54;

/* ─── Protein (ISSN 2017) ─── */
export type ProteinGoal = 'sedentary' | 'endurance' | 'strength' | 'cut' | 'older_adult';
export const PROTEIN_G_PER_KG: Record<ProteinGoal, [number, number]> = {
  sedentary: [0.8, 1.0],
  endurance: [1.2, 1.4],
  strength: [1.6, 2.0],
  cut: [2.0, 2.4],
  older_adult: [1.0, 1.2],
};
export function proteinRange(weightKg: number, goal: ProteinGoal): { low: number; high: number; perMeal: number } {
  const [low, high] = PROTEIN_G_PER_KG[goal];
  const avg = (low + high) / 2;
  return {
    low: Math.round(weightKg * low),
    high: Math.round(weightKg * high),
    perMeal: Math.round((weightKg * avg) / 4),
  };
}

/* ─── Water (NAM 2004 + activity) ─── */
export type Climate = 'normal' | 'hot';
export function waterIntakeMl(weightKg: number, exerciseHours: number, climate: Climate): number {
  const base = weightKg * 35;
  const activity = exerciseHours * 700;
  const climateAdj = climate === 'hot' ? 500 : 0;
  return Math.round(base + activity + climateAdj);
}

/* ─── Caffeine half-life (~5h average adult) ─── */
export const CAFFEINE_HALF_LIFE_HOURS = 5;
/** Latest safe cup time so [target] mg or less remain at bedtime. */
export function latestCaffeineCupTime(bedtime: Date, dosesMg: number, targetAtBedtimeMg: number): Date {
  if (dosesMg <= targetAtBedtimeMg) return bedtime;
  const halfLives = Math.log2(dosesMg / targetAtBedtimeMg);
  const hoursBeforeBed = halfLives * CAFFEINE_HALF_LIFE_HOURS;
  const t = new Date(bedtime.getTime());
  t.setMinutes(t.getMinutes() - Math.round(hoursBeforeBed * 60));
  return t;
}

/* ─── Sleep cycle (90 min cycles, 14 min to fall asleep) ─── */
export const SLEEP_CYCLE_MIN = 90;
export const FALL_ASLEEP_MIN = 14;
export function sleepTimesForWake(wakeAt: Date, cycles: number[] = [6, 5, 4, 3]): { cycles: number; bedtime: Date }[] {
  return cycles.map((n) => {
    const t = new Date(wakeAt.getTime());
    t.setMinutes(t.getMinutes() - (SLEEP_CYCLE_MIN * n + FALL_ASLEEP_MIN));
    return { cycles: n, bedtime: t };
  });
}

/* ─── Exercise calorie burn (METs × kg × hours) ─── */
export type ExerciseType =
  | 'walking_brisk' | 'running_8' | 'running_10' | 'running_12'
  | 'cycling_moderate' | 'cycling_vigorous'
  | 'swimming_moderate' | 'swimming_vigorous'
  | 'weight_training' | 'yoga' | 'pilates'
  | 'hiking' | 'jump_rope' | 'rowing' | 'elliptical'
  | 'basketball' | 'soccer' | 'tennis';

export const EXERCISE_METS: Record<ExerciseType, number> = {
  walking_brisk: 4.3,
  running_8: 8.3,
  running_10: 9.8,
  running_12: 11.5,
  cycling_moderate: 6.8,
  cycling_vigorous: 10.0,
  swimming_moderate: 6.0,
  swimming_vigorous: 9.8,
  weight_training: 5.0,
  yoga: 3.0,
  pilates: 3.0,
  hiking: 5.3,
  jump_rope: 11.8,
  rowing: 7.0,
  elliptical: 5.0,
  basketball: 8.0,
  soccer: 7.0,
  tennis: 7.3,
};

export function exerciseCalories(type: ExerciseType, durationMin: number, weightKg: number): number {
  const mets = EXERCISE_METS[type];
  return Math.round((mets * 3.5 * weightKg * durationMin) / 200);
}

/* ─── BMI + waist-to-height ratio ─── */
export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}
/** Waist-to-height ratio (Ashwell): waist ÷ height, same unit. */
export function whtr(waistCm: number, heightCm: number): number {
  return waistCm / heightCm;
}
/** Index of the category: number of cutoffs the BMI has reached (cuts ascending, lower bound inclusive). */
export function bmiCategoryIndex(value: number, cuts: number[]): number {
  return cuts.filter((c) => value >= c).length;
}

/* ─── Body fat — U.S. Navy circumference method (Hodgdon & Beckett 1984), lengths in cm ─── */
export function navyBodyFat(p: { sex: Sex; heightCm: number; neckCm: number; waistCm: number; hipCm?: number }): number | null {
  const { sex, heightCm, neckCm, waistCm } = p;
  if (!(heightCm > 0 && neckCm > 0 && waistCm > 0)) return null;
  if (sex === 'male') {
    const d = waistCm - neckCm;
    if (d <= 0) return null;
    return 495 / (1.0324 - 0.19077 * Math.log10(d) + 0.15456 * Math.log10(heightCm)) - 450;
  }
  const hip = p.hipCm ?? 0;
  const d = waistCm + hip - neckCm;
  if (!(hip > 0) || d <= 0) return null;
  return 495 / (1.29579 - 0.35004 * Math.log10(d) + 0.221 * Math.log10(heightCm)) - 450;
}
/** ACE body fat ranges. Upper bounds (exclusive) of the first four categories; the fifth is the rest. */
export const ACE_CUTS: Record<Sex, number[]> = {
  male: [6, 14, 18, 25],
  female: [14, 21, 25, 32],
};
