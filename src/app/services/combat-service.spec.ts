import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CombatService } from './combat-service';
import { CharacterService } from './character-service';
import { PrestigeUpgradeService } from './prestige-upgrade-service';
import { GoldUpgradeService } from './gold-upgrade-service';
import { Character } from '../models/character.model';
import { UpgradeEffectType } from '../models/prestige.model';

class MockCharacterService {
  character = signal<Character>({
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
  });
  hasLoadedFromDb = signal(true);
  modifyStat = jasmine.createSpy('modifyStat');
  advanceWave = jasmine.createSpy('advanceWave');
}

class MockPrestigeUpgradeService {
  effects = new Map<UpgradeEffectType, number>();

  getTotalEffect(effectType: UpgradeEffectType): number {
    return this.effects.get(effectType) ?? 0;
  }
}

class MockGoldUpgradeService {
  effects = new Map<UpgradeEffectType, number>();

  getTotalEffect(effectType: UpgradeEffectType): number {
    return this.effects.get(effectType) ?? 0;
  }
}

describe('CombatService', () => {
  let service: CombatService;
  let characterService: MockCharacterService;
  let prestigeUpgradeService: MockPrestigeUpgradeService;

  beforeEach(() => {
    characterService = new MockCharacterService();
    prestigeUpgradeService = new MockPrestigeUpgradeService();

    TestBed.configureTestingModule({
      providers: [
        CombatService,
        { provide: CharacterService, useValue: characterService },
        { provide: PrestigeUpgradeService, useValue: prestigeUpgradeService },
        { provide: GoldUpgradeService, useValue: new MockGoldUpgradeService() },
      ],
    });

    service = TestBed.inject(CombatService);
  });

  afterEach(() => {
    service.stopFighting();
  });

  it('clamps attack speed to the configured minimum', () => {
    prestigeUpgradeService.effects.set(UpgradeEffectType.ATTACK_SPEED, 10);

    expect(service.calculateAttackSpeed()).toBe(100);
  });

  it('keeps enemy health positive when an invalid reduction reaches 100%', () => {
    prestigeUpgradeService.effects.set(UpgradeEffectType.ENEMY_HEALTH_REDUCTION, 10);

    expect(service.enemyMaxHP()).toBe(1);
  });

  it('applies the diminishing Fragile Foes effect to enemy max HP', () => {
    prestigeUpgradeService.effects.set(
      UpgradeEffectType.ENEMY_HEALTH_REDUCTION,
      0.676466455026291,
    );

    expect(service.enemyMaxHP()).toBe(32);
  });

  it('does not start multiple fight loops when already fighting', () => {
    const scheduleSpy = spyOn<any>(service, 'scheduleNextAttack').and.callThrough();

    service.startFighting();
    service.startFighting();

    expect(scheduleSpy.calls.count()).toBe(1);
  });

  it('passes the purchased Overkill wave limit when excess damage clears an enemy', () => {
    characterService.character.update((character) => ({ ...character, baseStrength: 1_000 }));
    prestigeUpgradeService.effects.set(UpgradeEffectType.OVERKILL_WAVE, 2);
    service.enemyHP.set(service.enemyMaxHP());

    service.startFighting();
    service.stopFighting();

    expect(characterService.advanceWave.calls.count()).toBe(3);
    expect(characterService.advanceWave.calls.allArgs()).toEqual([[], [], []]);
  });

  it('does not overkill waves when the attack only defeats the current enemy', () => {
    characterService.character.update((character) => ({ ...character, baseStrength: 100 }));
    prestigeUpgradeService.effects.set(UpgradeEffectType.OVERKILL_WAVE, 2);
    service.enemyHP.set(service.enemyMaxHP());

    service.startFighting();
    service.stopFighting();

    expect(characterService.advanceWave.calls.count()).toBe(1);
    expect(characterService.advanceWave.calls.allArgs()).toEqual([[]]);
  });

  it('carries remaining damage into the next target after overkilling one wave', () => {
    spyOn(Math, 'random').and.returnValue(1);
    characterService.character.update((character) => ({ ...character, baseStrength: 100 }));
    prestigeUpgradeService.effects.set(UpgradeEffectType.ENEMY_HEALTH_REDUCTION, 0.6);
    prestigeUpgradeService.effects.set(UpgradeEffectType.OVERKILL_WAVE, 1);
    characterService.advanceWave.and.callFake(() => {
      characterService.character.update((character) => ({
        ...character,
        currentWave: character.currentWave === 10 ? 1 : character.currentWave + 1,
        currentStage:
          character.currentWave === 10 ? character.currentStage + 1 : character.currentStage,
      }));
    });
    service.enemyHP.set(service.enemyMaxHP());

    service.startFighting();
    service.stopFighting();

    expect(characterService.advanceWave.calls.count()).toBe(2);
    expect(service.enemyHP()).toBe(26);
  });
});
