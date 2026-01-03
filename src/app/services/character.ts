import { effect, Injectable, signal } from '@angular/core';
import { Character } from '../models/character.model';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  character = signal<Character>(this.loadCharacter());

  constructor() {
    effect(() => {
      localStorage.setItem('character', JSON.stringify(this.character()));
    });
  }

  private loadCharacter(): Character {
    const saved = localStorage.getItem('character');
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      id: '1',
      name: 'Hero',
      level: 10,
      baseStrength: 15,
      baseIntelligence: 12,
      baseEndurance: 14,
      strengthModifier: 2,
      intelligenceModifier: 3,
      enduranceModifier: 1,
      prestigeLevel: 0,
      prestigeMultipliers: {
        strength: 1,
        intelligence: 1,
        endurance: 1,
      },
      gold: 1000,
      currentStage: 1,
      currentWave: 1,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };
  }

  modifyStat(
    stat: keyof Pick<
      Character,
      'level' | 'baseStrength' | 'baseIntelligence' | 'baseEndurance' | 'gold'
    >,
    amount: number
  ) {
    const currentValue = this.character()[stat];
    const newValue = currentValue + amount;
    if (newValue >= 0) {
      this.character.update((char) => ({ ...char, [stat]: newValue }));
    }
  }
}
