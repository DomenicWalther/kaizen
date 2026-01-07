export interface Milestone {
  id: string;
  type: 'Strength' | 'Intelligence' | 'Endurance';
  requirement: string;
  reward: number;
  achieved: boolean;
  achievedAt?: Date;
  level: number;
}
