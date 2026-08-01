import { effect, Injectable, inject, signal } from '@angular/core';
import { Character } from '../models/character.model';
import { injectMutation, injectQuery } from 'convex-angular';
import { api } from '../../../convex/_generated/api';
import { ClerkService } from './clerk.service';

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  character = signal<Character>(this.returnDefaultCharacter());
  private readonly clerkService = inject(ClerkService);
  private activeUserId = signal<string | null>(null);

  private getCharacterFromDatabase = injectQuery(api.character.getCharacter, () => ({}));
  private databaseUpdateMutation = injectMutation(api.character.updateCharacter);
  hasLoadedFromDb = signal(false);

  constructor() {
    const defaultCharacter = this.returnDefaultCharacter();
    effect(() => {
      const userId = this.clerkService.user()?.id ?? null;
      if (this.activeUserId() === userId) return;

      this.activeUserId.set(userId);
      this.hasLoadedFromDb.set(false);
      this.character.set(this.returnDefaultCharacter());
    });

    effect(() => {
      const userId = this.clerkService.user()?.id ?? null;
      if (!userId) return;

      const dbCharacter = this.getCharacterFromDatabase.data();
      if (dbCharacter === undefined) return;

      if (dbCharacter === null) {
        this.character.set(defaultCharacter);
        this.hasLoadedFromDb.set(true);
        return;
      }

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
      prestigeCores: currentChar.prestigeCores, // Preserve
      gold: currentChar.gold, // Preserve
      currentStage: 1,
      currentWave: 1,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    });
  }
  private returnDefaultCharacter(): Character {
    // Pure defaults for initial load
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
      prestigeCores: 0,
      gold: 0,
      currentStage: 1,
      currentWave: 1,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };
  }
  advanceWave(overkillWaves = 0) {
    const wavesToSkip = Number.isFinite(overkillWaves)
      ? Math.max(0, Math.floor(overkillWaves))
      : 0;

    this.character.update((char) => {
      const currentWaveIndex = (char.currentStage - 1) * 10 + (char.currentWave - 1);
      const nextWaveIndex = currentWaveIndex + wavesToSkip + 1;

      return {
        ...char,
        currentStage: Math.floor(nextWaveIndex / 10) + 1,
        currentWave: (nextWaveIndex % 10) + 1,
      };
    });
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
