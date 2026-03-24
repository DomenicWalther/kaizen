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
  let prestigeUpgradeService: MockPrestigeUpgradeService;

  beforeEach(() => {
    prestigeUpgradeService = new MockPrestigeUpgradeService();

    TestBed.configureTestingModule({
      providers: [
        CombatService,
        { provide: CharacterService, useValue: new MockCharacterService() },
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

  it('clamps enemy health reduction so max HP never drops to 0', () => {
    prestigeUpgradeService.effects.set(UpgradeEffectType.ENEMY_HEALTH_REDUCTION, 10);

    expect(service.enemyMaxHP()).toBe(5);
  });

  it('does not start multiple fight loops when already fighting', () => {
    const scheduleSpy = spyOn<any>(service, 'scheduleNextAttack').and.callThrough();

    service.startFighting();
    service.startFighting();

    expect(scheduleSpy.calls.count()).toBe(1);
  });
});
