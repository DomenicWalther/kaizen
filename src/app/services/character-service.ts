import { effect, Injectable, signal } from '@angular/core';
import { Character } from '../models/character.model';
import { injectMutation, injectQuery } from 'convex-angular';
import { api } from '../../../convex/_generated/api';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  character = signal<Character>(this.returnDefaultCharacter());

  private getCharacterFromDatabase = injectQuery(api.character.getCharacter, () => ({}));
  private databaseUpdateMutation = injectMutation(api.character.updateCharacter);
  hasLoadedFromDb = signal(false);

  constructor() {
    const defaultCharacter = this.returnDefaultCharacter();
    effect(() => {
      const dbCharacter = this.getCharacterFromDatabase.data();
      if (!dbCharacter) return;
      if (this.hasLoadedFromDb()) {
        this.character.update((char) => ({
          ...char,
          ...dbCharacter,
        }));
      } else {
        const merged = { ...defaultCharacter, ...dbCharacter };

        this.character.set(merged);
        this.hasLoadedFromDb.set(true);
      }
    });
  }

  // private loadCharacter(): Character {
  //   const defaultCharacter = this.returnDefaultCharacter();
  //   const dbCharacter = this.getCharacterFromDatabase.data();
  //   return { ...defaultCharacter, ...dbCharacter };
  // }

  public updateDatabase(): void {
    const characterToSave = {
      id: this.character().id,
      prestigeLevel: this.character().prestigeLevel,
      prestigeMultipliers: this.character().prestigeMultipliers,
      prestigeCores: this.character().prestigeCores,
      gold: this.character().gold,
      currentStage: this.character().currentStage,
      currentWave: this.character().currentWave,
    };
    this.databaseUpdateMutation.mutate(characterToSave);
  }

  resetCharacter() {
    // Preserve prestige-related values when resetting
    const currentChar = this.character();

    this.character.set({
      id: '1',
      name: 'Hero',
      level: 1,
      baseStrength: 1,
      baseIntelligence: 1,
      baseEndurance: 1,
      strengthModifier: 1,
      intelligenceModifier: 1,
      enduranceModifier: 1,
      prestigeLevel: currentChar.prestigeLevel, // Preserve
      prestigeMultipliers: currentChar.prestigeMultipliers, // Preserve
      alchemyDust: currentChar.alchemyDust,
      prestigeCores: currentChar.prestigeCores, // Preserve
      gold: currentChar.gold, // Preserve
      currentStage: 1,
      currentWave: 1,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    });
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
      prestigeLevel: 1,
      prestigeMultipliers: {
        strength: 1,
        intelligence: 1,
        endurance: 1,
      },
      alchemyDust: {
        basic_dust: 0,
        improved_dust: 0,
        advanced_dust: 0,
      },
      prestigeCores: 0,
      gold: 0,
      currentStage: 1,
      currentWave: 1,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };
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
