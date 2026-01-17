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
    return this.returnDefaultCharacter();
  }

  private returnDefaultCharacter(): Character {
    return {
      id: '1',
      name: 'Hero',
      level: 1,
      baseStrength: 1,
      baseIntelligence: 1,
      baseEndurance: 1,
      strengthModifier: 1,
      intelligenceModifier: 1,
      enduranceModifier: 1,
      prestigeLevel: this.character().prestigeLevel || 1,
      prestigeMultipliers: {
        strength: 1,
        intelligence: 1,
        endurance: 1,
      },
      alchemyDust: {
        basic_dust: this.character().alchemyDust.basic_dust || 0,
        improved_dust: this.character().alchemyDust.improved_dust || 0,
        advanced_dust: this.character().alchemyDust.advanced_dust || 0,
      },
      prestigeCores: this.character().prestigeCores || 0,
      gold: this.character().gold || 0,
      currentStage: 1,
      currentWave: 1,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };
  }

  resetCharacter() {
    this.character.set(this.returnDefaultCharacter());
  }

  advanceWave() {
    this.character.update((char) => ({
      ...char,
      currentWave: char.currentWave < 10 ? char.currentWave + 1 : 1,
      currentStage: char.currentWave === 10 ? char.currentStage + 1 : char.currentStage,
    }));
  }

  modifyStat(
    stat: keyof Pick<
      Character,
      | 'level'
      | 'baseStrength'
      | 'baseIntelligence'
      | 'baseEndurance'
      | 'gold'
      | 'prestigeLevel'
      | 'prestigeCores'
    >,
    amount: number,
  ) {
    const currentValue = this.character()[stat];
    const newValue = currentValue + amount;
    if (newValue >= 0) {
      this.character.update((char) => ({ ...char, [stat]: newValue }));
    }
  }
  spendPrestigeCores(cost: number) {
    this.character.update((char) => ({
      ...char,
      prestigeCores: char.prestigeCores - cost,
    }));
  }

  spendGold(cost: number) {
    this.character.update((char) => ({
      ...char,
      gold: char.gold - cost,
    }));
  }
}
