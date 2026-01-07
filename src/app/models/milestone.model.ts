export interface Milestone {
  id: string;
  type: 'Strength' | 'Intelligence' | 'Endurance';
  requirement: string;
  reward: string;
  achieved: boolean;
  achievedAt?: Date;
  level: number;
}
