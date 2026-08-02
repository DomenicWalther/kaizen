export interface Upgrade {
  id: string;
  name: string;
  description: string;

  baseCost: number;
  costScaling: number;

  effectType: UpgradeEffectType;
  effectValue: number;
  effectScaling: UpgradeScalingType;

  currentLevel: number;
}

export enum UpgradeEffectType {
  FLAT_STAT_BOOST = 'flat_stat_boost',
  MULTIPLIER_BOOST = 'multiplier_boost',
  ATTACK_SPEED = 'attack_speed',
  ENEMY_HEALTH_REDUCTION = 'enemy_health_reduction',
  OVERKILL_WAVE = 'overkill_wave',
  DYNAMIC_PER_CORE = 'dynamic_per_core',
  CRITICAL_CHANCE_BOOST = 'critical_chance_boost',
  CRITICAL_DAMAGE_BOOST = 'critical_damage_boost',
}

export enum UpgradeScalingType {
  LINEAR = 'linear',
  DIMINISHING_RETURNS = 'diminishing_returns',
  EXPONENTIAL = 'exponential',
  FIXED_PER_LEVEL = 'fixed_per_level',
}

export function calculateUpgradeEffect(
  effectValue: number,
  effectScaling: UpgradeScalingType,
  currentLevel: number,
): number {
  switch (effectScaling) {
    case UpgradeScalingType.LINEAR:
      return effectValue * currentLevel;
    case UpgradeScalingType.DIMINISHING_RETURNS:
      return 1 - Math.pow(1 - effectValue, currentLevel);
    case UpgradeScalingType.EXPONENTIAL:
      return Math.pow(effectValue, currentLevel);
    case UpgradeScalingType.FIXED_PER_LEVEL:
      return effectValue * (currentLevel > 0 ? 1 : 0);
    default:
      return 0;
  }
}
