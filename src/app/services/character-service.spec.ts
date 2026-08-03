import { signal } from '@angular/core';
import { CharacterService } from './character-service';
import { Character } from '../models/character.model';

describe('CharacterService progression', () => {
  it('converts fifteen overkill waves into one and a half stages', () => {
    const character = signal<Character>({
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
      prestigeMultipliers: { strength: 1, intelligence: 1, endurance: 1 },
      prestigeCores: 0,
      gold: 0,
      currentStage: 50,
      currentWave: 1,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    });
    const service = Object.create(CharacterService.prototype) as CharacterService;
    service.character = character;

    service.advanceWave(15);

    expect(character().currentStage).toBe(51);
    expect(character().currentWave).toBe(7);
  });

  it('resets every progression field to the default character state', () => {
    const character = signal<Character>({
      id: '1',
      name: 'Hero',
      level: 42,
      baseStrength: 99,
      baseIntelligence: 99,
      baseEndurance: 99,
      strengthModifier: 1,
      intelligenceModifier: 1,
      enduranceModifier: 1,
      prestigeLevel: 8,
      prestigeMultipliers: { strength: 4, intelligence: 3, endurance: 2 },
      prestigeCores: 123,
      gold: 456,
      currentStage: 50,
      currentWave: 10,
      createdAt: new Date(0),
      lastActiveAt: new Date(0),
    });
    const service = Object.create(CharacterService.prototype) as CharacterService;
    service.character = character;

    service.resetProgress();

    expect(character()).toEqual(
      jasmine.objectContaining({
        level: 1,
        baseStrength: 1,
        baseIntelligence: 1,
        baseEndurance: 1,
        prestigeLevel: 1,
        prestigeCores: 0,
        gold: 0,
        currentStage: 1,
        currentWave: 1,
      }),
    );
    expect(character().prestigeMultipliers).toEqual({
      strength: 1,
      intelligence: 1,
      endurance: 1,
    });
  });
});
