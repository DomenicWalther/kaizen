export interface Character {
  id: string;
  name: string;
  level: number;

  baseStrength: number;
  baseIntelligence: number;
  baseEndurance: number;

  strengthModifier: number;
  intelligenceModifier: number;
  enduranceModifier: number;

  prestigeLevel: number;
  prestigeMultipliers: {
    strength: number;
    intelligence: number;
    endurance: number;
  };
  prestigeCores: number;

  gold: number;

  currentStage: number;
  currentWave: number;

  createdAt: Date;
  lastActiveAt: Date;
}
