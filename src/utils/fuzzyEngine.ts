/**
 * FuzzySense - Mamdani Fuzzy Inference System (FIS) Engine
 * Soft Computing Lab Practical - Roll No. 61 to 71
 * 
 * Features:
 * - Mathematical Triangular & Trapezoidal Membership Functions
 * - Fuzzification of input variables (Color, Smell, Storage Duration)
 * - 27-Rule Mamdani Inference Engine with Min-T-Norm implication
 * - Max-S-Norm Aggregation
 * - Defuzzification using Centroid Method (Center of Gravity / COG)
 * - Food Profiles with calibrated storage duration spans
 */

export type LinguisticColor = 'Poor' | 'Acceptable' | 'Good';
export type LinguisticSmell = 'Fresh' | 'Moderate' | 'Pungent';
export type LinguisticDuration = 'Short' | 'Medium' | 'Long';
export type LinguisticFreshness = 'Spoiled' | 'Moderate' | 'Fresh';

export interface MembershipValue {
  name: string;
  degree: number; // 0.0 to 1.0
}

export interface FuzzifiedInputs {
  color: {
    poor: number;
    acceptable: number;
    good: number;
  };
  smell: {
    fresh: number;
    moderate: number;
    pungent: number;
  };
  duration: {
    short: number;
    medium: number;
    long: number;
  };
}

export interface FuzzyRule {
  id: number;
  color: LinguisticColor;
  smell: LinguisticSmell;
  duration: LinguisticDuration;
  consequent: LinguisticFreshness;
  firingStrength: number; // alpha_i = min(mu_color, mu_smell, mu_duration)
  description: string;
}

export interface FuzzyResult {
  crispInputs: {
    color: number;
    smell: number;
    duration: number;
  };
  fuzzified: FuzzifiedInputs;
  rules: FuzzyRule[];
  activeRules: FuzzyRule[]; // rules where firingStrength > 0
  aggregatedCurve: { y: number; mu: number }[]; // Discretized 0-100%
  crispOutput: number; // Centroid result 0-100%
  status: 'Fresh' | 'Moderate' | 'Spoiled';
  statusBadge: {
    label: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
  };
  safetyConfidence: number; // Percentage
  recommendation: string;
}

export interface FoodProfile {
  id: string;
  name: string;
  category: string;
  icon: string;
  maxStorageDays: number;
  durationBreaks: [number, number, number, number]; // [shortPeak, shortEnd, longStart, longPeak]
  spoilageRiskFactor: 'High' | 'Medium' | 'Low';
  description: string;
}

export const FOOD_PROFILES: FoodProfile[] = [
  {
    id: 'generic',
    name: 'Standard Produce',
    category: 'Universal Model',
    icon: '🍎',
    maxStorageDays: 20,
    durationBreaks: [3, 7, 10, 18],
    spoilageRiskFactor: 'Medium',
    description: 'General calibrated baseline for mixed grocery and fresh produce items.',
  },
  {
    id: 'milk',
    name: 'Fresh Whole Milk / Dairy',
    category: 'Dairy',
    icon: '🥛',
    maxStorageDays: 10,
    durationBreaks: [2, 4, 6, 9],
    spoilageRiskFactor: 'High',
    description: 'Extremely smell-sensitive bacterial spoilage model (lactic acid fermentation).',
  },
  {
    id: 'meat',
    name: 'Raw Poultry & Red Meat',
    category: 'Meat & Poultry',
    icon: '🥩',
    maxStorageDays: 7,
    durationBreaks: [1, 3, 4, 6],
    spoilageRiskFactor: 'High',
    description: 'High pathogen sensitivity; pungent odor rapidly overrides color indicators.',
  },
  {
    id: 'fish',
    name: 'Fresh Fish & Seafood',
    category: 'Seafood',
    icon: '🐟',
    maxStorageDays: 5,
    durationBreaks: [1, 2, 3, 5],
    spoilageRiskFactor: 'High',
    description: 'Trimethylamine odor surge; quick deterioration timeline.',
  },
  {
    id: 'fruits',
    name: 'Apples & Citrus Fruits',
    category: 'Fruits',
    icon: '🍊',
    maxStorageDays: 30,
    durationBreaks: [5, 12, 16, 26],
    spoilageRiskFactor: 'Low',
    description: 'Extended shelf-life; visual discoloration and browning are key markers.',
  },
  {
    id: 'bread',
    name: 'Artisan Bread & Bakery',
    category: 'Bakery',
    icon: '🍞',
    maxStorageDays: 12,
    durationBreaks: [2, 5, 7, 11],
    spoilageRiskFactor: 'Medium',
    description: 'Surface mold growth and staling odor profile.',
  }
];

// --- Standard Membership Functions ---

/**
 * Triangular Membership Function
 * trimf(x, [a, b, c]) = max(min((x - a) / (b - a), (c - x) / (c - b)), 0)
 */
export function trimf(x: number, a: number, b: number, c: number): number {
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

/**
 * Trapezoidal Membership Function
 * trapmf(x, [a, b, c, d])
 */
export function trapmf(x: number, a: number, b: number, c: number, d: number): number {
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
}

/**
 * Left Shoulder Membership Function
 */
export function leftShoulder(x: number, a: number, b: number): number {
  if (x <= a) return 1;
  if (x >= b) return 0;
  return (b - x) / (b - a);
}

/**
 * Right Shoulder Membership Function
 */
export function rightShoulder(x: number, a: number, b: number): number {
  if (x <= a) return 0;
  if (x >= b) return 1;
  return (x - a) / (b - a);
}

// --- Fuzzification Functions ---

export function fuzzifyColor(score: number): { poor: number; acceptable: number; good: number } {
  // Color scale: 0 (heavily browned/discolored) to 10 (fresh/vibrant)
  const poor = leftShoulder(score, 2.5, 5.0);
  const acceptable = trimf(score, 3.0, 5.5, 8.0);
  const good = rightShoulder(score, 6.0, 8.5);
  return { poor, acceptable, good };
}

export function fuzzifySmell(index: number): { fresh: number; moderate: number; pungent: number } {
  // Smell scale: 0 (pure/pleasant/neutral) to 10 (putrid/sour/ammonia)
  const fresh = leftShoulder(index, 2.0, 4.5);
  const moderate = trimf(index, 3.0, 5.5, 7.5);
  const pungent = rightShoulder(index, 6.0, 8.5);
  return { fresh, moderate, pungent };
}

export function fuzzifyDuration(
  days: number,
  profile: FoodProfile = FOOD_PROFILES[0]
): { short: number; medium: number; long: number } {
  const [sPeak, sEnd, lStart, lPeak] = profile.durationBreaks;
  const mPeak = (sEnd + lStart) / 2;

  const short = leftShoulder(days, sPeak, sEnd);
  const medium = trimf(days, sPeak, mPeak, lPeak);
  const long = rightShoulder(days, lStart, lPeak);

  return { short, medium, long };
}

// Freshness Output Fuzzy Sets for defuzzification over range [0, 100]
export function freshnessMembership(y: number): { spoiled: number; moderate: number; fresh: number } {
  const spoiled = leftShoulder(y, 25, 50);
  const moderate = trimf(y, 35, 60, 80);
  const fresh = rightShoulder(y, 65, 85);
  return { spoiled, moderate, fresh };
}

// Complete 27-Rule Mamdani Matrix
export const BASE_RULES_DEFINITIONS: Omit<FuzzyRule, 'firingStrength'>[] = [
  // When Smell is Fresh
  { id: 1, color: 'Good', smell: 'Fresh', duration: 'Short', consequent: 'Fresh', description: 'Optimal condition: vibrant color, fresh smell, newly stored.' },
  { id: 2, color: 'Good', smell: 'Fresh', duration: 'Medium', consequent: 'Fresh', description: 'Well preserved: vibrant color and neutral smell despite moderate time.' },
  { id: 3, color: 'Good', smell: 'Fresh', duration: 'Long', consequent: 'Moderate', description: 'Extended storage starting to degrade internal nutrients despite pleasant appearance.' },
  
  { id: 4, color: 'Acceptable', smell: 'Fresh', duration: 'Short', consequent: 'Fresh', description: 'Minor cosmetic variation, but fresh smell and short storage guarantee quality.' },
  { id: 5, color: 'Acceptable', smell: 'Fresh', duration: 'Medium', consequent: 'Moderate', description: 'Standard acceptable quality; consume in near future.' },
  { id: 6, color: 'Acceptable', smell: 'Fresh', duration: 'Long', consequent: 'Moderate', description: 'Aging batch; aesthetic degradation and time elapsed.' },

  { id: 7, color: 'Poor', smell: 'Fresh', duration: 'Short', consequent: 'Moderate', description: 'Bruised or discolored physically, but no microbial odor.' },
  { id: 8, color: 'Poor', smell: 'Fresh', duration: 'Medium', consequent: 'Moderate', description: 'Substantial discoloration with moderate shelf time.' },
  { id: 9, color: 'Poor', smell: 'Fresh', duration: 'Long', consequent: 'Spoiled', description: 'Severely discolored and aged beyond recommended duration.' },

  // When Smell is Moderate
  { id: 10, color: 'Good', smell: 'Moderate', duration: 'Short', consequent: 'Fresh', description: 'Slight odor variation but fresh look and short shelf life.' },
  { id: 11, color: 'Good', smell: 'Moderate', duration: 'Medium', consequent: 'Moderate', description: 'Borderline quality: perceptible scent change occurring.' },
  { id: 12, color: 'Good', smell: 'Moderate', duration: 'Long', consequent: 'Spoiled', description: 'Long storage with detectable odor indicates developing bacterial colonies.' },

  { id: 13, color: 'Acceptable', smell: 'Moderate', duration: 'Short', consequent: 'Moderate', description: 'Acceptable appearance but noticeable scent developing.' },
  { id: 14, color: 'Acceptable', smell: 'Moderate', duration: 'Medium', consequent: 'Moderate', description: 'Consume immediately; nearing expiration window.' },
  { id: 15, color: 'Acceptable', smell: 'Moderate', duration: 'Long', consequent: 'Spoiled', description: 'Degraded sensory attributes combined with lengthy storage.' },

  { id: 16, color: 'Poor', smell: 'Moderate', duration: 'Short', consequent: 'Moderate', description: 'Compromised color and off-scent; high risk of quick spoilage.' },
  { id: 17, color: 'Poor', smell: 'Moderate', duration: 'Medium', consequent: 'Spoiled', description: 'Unfit for consumption due to compounded discoloration and odor.' },
  { id: 18, color: 'Poor', smell: 'Moderate', duration: 'Long', consequent: 'Spoiled', description: 'Advanced spoilage stage across all parameters.' },

  // When Smell is Pungent (Biological Red Line: smell pungency strongly forces Spoiled)
  { id: 19, color: 'Good', smell: 'Pungent', duration: 'Short', consequent: 'Spoiled', description: 'Foul odor overrides visual appearance (potential anaerobic contamination).' },
  { id: 20, color: 'Good', smell: 'Pungent', duration: 'Medium', consequent: 'Spoiled', description: 'Off-putting putrefaction scent overrides visual integrity.' },
  { id: 21, color: 'Good', smell: 'Pungent', duration: 'Long', consequent: 'Spoiled', description: 'Deceptive exterior; microbiological breakdown produces strong gases.' },

  { id: 22, color: 'Acceptable', smell: 'Pungent', duration: 'Short', consequent: 'Spoiled', description: 'Pungent odor indicates bacterial proliferation.' },
  { id: 23, color: 'Acceptable', smell: 'Pungent', duration: 'Medium', consequent: 'Spoiled', description: 'Spoiled: unpleasant smell indicates safety violation.' },
  { id: 24, color: 'Acceptable', smell: 'Pungent', duration: 'Long', consequent: 'Spoiled', description: 'Clear biological rot.' },

  { id: 25, color: 'Poor', smell: 'Pungent', duration: 'Short', consequent: 'Spoiled', description: 'Severe discoloration coupled with pungent smell.' },
  { id: 26, color: 'Poor', smell: 'Pungent', duration: 'Medium', consequent: 'Spoiled', description: 'Complete degradation; unsafe for consumption.' },
  { id: 27, color: 'Poor', smell: 'Pungent', duration: 'Long', consequent: 'Spoiled', description: 'Total rot; toxic decomposition.' },
];

/**
 * Evaluate the Mamdani Fuzzy Inference System
 */
export function evaluateFuzzyModel(
  colorScore: number,
  smellIndex: number,
  storageDays: number,
  profile: FoodProfile = FOOD_PROFILES[0]
): FuzzyResult {
  // 1. Fuzzification
  const colorMu = fuzzifyColor(colorScore);
  const smellMu = fuzzifySmell(smellIndex);
  const durMu = fuzzifyDuration(storageDays, profile);

  // 2. Rule Evaluation (Mamdani Min T-Norm implication)
  const rules: FuzzyRule[] = BASE_RULES_DEFINITIONS.map((def) => {
    // get antecedent membership values
    let muC = 0;
    if (def.color === 'Poor') muC = colorMu.poor;
    else if (def.color === 'Acceptable') muC = colorMu.acceptable;
    else muC = colorMu.good;

    let muS = 0;
    if (def.smell === 'Fresh') muS = smellMu.fresh;
    else if (def.smell === 'Moderate') muS = smellMu.moderate;
    else muS = smellMu.pungent;

    let muD = 0;
    if (def.duration === 'Short') muD = durMu.short;
    else if (def.duration === 'Medium') muD = durMu.medium;
    else muD = durMu.long;

    // Mamdani AND operation = min(muC, muS, muD)
    const firingStrength = Math.min(muC, muS, muD);

    return {
      ...def,
      firingStrength,
    };
  });

  const activeRules = rules.filter((r) => r.firingStrength > 0.001);

  // 3. Consequent Aggregation (Max S-Norm)
  // Discretize y from 0 to 100 with step = 1 (101 points)
  const aggregatedCurve: { y: number; mu: number }[] = [];
  let numerator = 0;
  let denominator = 0;

  for (let y = 0; y <= 100; y += 1) {
    const freshMu = freshnessMembership(y);
    let aggregatedMu = 0;

    for (const rule of activeRules) {
      let targetConsequentMu = 0;
      if (rule.consequent === 'Spoiled') targetConsequentMu = freshMu.spoiled;
      else if (rule.consequent === 'Moderate') targetConsequentMu = freshMu.moderate;
      else targetConsequentMu = freshMu.fresh;

      // Mamdani implication = min(firingStrength, membership_of_consequent)
      const clipped = Math.min(rule.firingStrength, targetConsequentMu);
      // Max aggregation
      if (clipped > aggregatedMu) {
        aggregatedMu = clipped;
      }
    }

    aggregatedCurve.push({ y, mu: aggregatedMu });

    // For Centroid defuzzification: sum(y * mu) / sum(mu)
    numerator += y * aggregatedMu;
    denominator += aggregatedMu;
  }

  // 4. Defuzzification (Centroid / Center of Gravity Method)
  let crispOutput = 50; // Fallback neutral
  if (denominator > 0.0001) {
    crispOutput = numerator / denominator;
  }

  // Clamp output 0-100
  crispOutput = Math.max(0, Math.min(100, Math.round(crispOutput * 10) / 10));

  // Determine Categorization and Badges
  let status: 'Fresh' | 'Moderate' | 'Spoiled';
  let statusBadge: FuzzyResult['statusBadge'];
  let recommendation: string;

  if (crispOutput >= 75) {
    status = 'Fresh';
    statusBadge = {
      label: 'Fresh & Safe to Consume',
      description: 'Optimum nutritional value and sensory quality intact.',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      icon: 'CheckCircle2',
    };
    recommendation = 'Product is in prime state. Safe for direct consumption or retail sale.';
  } else if (crispOutput >= 45) {
    status = 'Moderate';
    statusBadge = {
      label: 'Moderate / Consume Promptly',
      description: 'Borderline freshness; noticeable sensory decline.',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      icon: 'AlertTriangle',
    };
    recommendation = 'Consume within 24 hours or cook thoroughly. Keep refrigerated.';
  } else {
    status = 'Spoiled';
    statusBadge = {
      label: 'Spoiled / Discard Immediately',
      description: 'Microbial degradation or severe quality loss detected.',
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      icon: 'AlertOctagon',
    };
    recommendation = 'Biohazard risk! High likelihood of pathogenic bacteria. Do not ingest.';
  }

  // Soft computing confidence derived from total rule firing mass
  const safetyConfidence = Math.min(99.4, Math.round((Math.max(...rules.map((r) => r.firingStrength)) * 80 + 20) * 10) / 10);

  return {
    crispInputs: {
      color: colorScore,
      smell: smellIndex,
      duration: storageDays,
    },
    fuzzified: {
      color: colorMu,
      smell: smellMu,
      duration: durMu,
    },
    rules,
    activeRules,
    aggregatedCurve,
    crispOutput,
    status,
    statusBadge,
    safetyConfidence,
    recommendation,
  };
}
