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
  DYNAMIC_PER_CORE = 'dynamic_per_core',
}

export enum UpgradeScalingType {
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  FIXED_PER_LEVEL = 'fixed_per_level',
}
