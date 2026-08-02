import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Character } from '../models/character.model';
import { MacroService } from './macro-service';
import { CharacterService } from './character-service';
import { CombatService } from './combat-service';
import { PrestigeService } from './prestige-service';

function createCharacter(): Character {
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
    prestigeMultipliers: { strength: 1, intelligence: 1, endurance: 1 },
    prestigeCores: 0,
    gold: 0,
    currentStage: 1,
    currentWave: 1,
    createdAt: new Date(),
    lastActiveAt: new Date(),
  };
}

describe('MacroService', () => {
  let service: MacroService;
  let characterService: { character: ReturnType<typeof signal<Character>> };
  let combatService: {
    isFighting: ReturnType<typeof signal<boolean>>;
    startFighting: jasmine.Spy;
    stopFighting: jasmine.Spy;
  };
  let prestigeService: {
    calculatePrestigeCores: jasmine.Spy;
    prestige: jasmine.Spy;
  };

  beforeEach(() => {
    localStorage.removeItem('kaizen-macro');
    jasmine.clock().install();

    characterService = { character: signal(createCharacter()) };
    combatService = {
      isFighting: signal(false),
      startFighting: jasmine.createSpy('startFighting').and.callFake(() => {
        combatService.isFighting.set(true);
      }),
      stopFighting: jasmine.createSpy('stopFighting').and.callFake(() => {
        combatService.isFighting.set(false);
      }),
    };
    prestigeService = {
      calculatePrestigeCores: jasmine.createSpy('calculatePrestigeCores').and.returnValue(1),
      prestige: jasmine.createSpy('prestige'),
    };

    TestBed.configureTestingModule({
      providers: [
        MacroService,
        { provide: CharacterService, useValue: characterService },
        { provide: CombatService, useValue: combatService },
        { provide: PrestigeService, useValue: prestigeService },
      ],
    });

    service = TestBed.inject(MacroService);
  });

  afterEach(() => {
    service.stop();
    jasmine.clock().uninstall();
    localStorage.removeItem('kaizen-macro');
  });

  it('runs blocks from top to bottom and ascends after the stage target is reached', () => {
    service.addReachStage(5);
    service.addAscend();

    expect(service.start()).toBeTrue();
    expect(combatService.startFighting).toHaveBeenCalled();
    expect(prestigeService.prestige).not.toHaveBeenCalled();

    characterService.character.update((character) => ({
      ...character,
      currentStage: 5,
    }));
    jasmine.clock().tick(100);

    expect(prestigeService.prestige).toHaveBeenCalledTimes(1);
    expect(service.status()).toBe('completed');
    expect(service.isRunning()).toBeFalse();
    expect(combatService.stopFighting).toHaveBeenCalled();
  });

  it('waits for the reach-stage condition before advancing to the next block', () => {
    service.addReachStage(5);
    service.addAscend();
    service.start();

    jasmine.clock().tick(500);

    expect(prestigeService.prestige).not.toHaveBeenCalled();
    expect(service.activeBlock()?.type).toBe('reach-stage');
    expect(service.status()).toBe('running');
  });

  it('restarts from the first block instead of completing when looping is enabled', () => {
    service.addReachStage(1);
    service.addAscend();
    service.setLooping(true);

    service.start();

    expect(prestigeService.prestige).toHaveBeenCalledTimes(1);
    expect(service.isRunning()).toBeTrue();
    expect(service.activeBlockIndex()).toBe(0);

    jasmine.clock().tick(100);

    expect(prestigeService.prestige).toHaveBeenCalledTimes(2);
    expect(service.status()).toBe('running');
  });

  it('blocks an ascend action when the player is not eligible yet', () => {
    prestigeService.calculatePrestigeCores.and.returnValue(0);
    service.addAscend();

    service.start();
    jasmine.clock().tick(100);

    expect(prestigeService.prestige).not.toHaveBeenCalled();
    expect(service.status()).toBe('blocked');
    expect(service.statusMessage()).toContain('not available');
    expect(combatService.stopFighting).toHaveBeenCalled();
  });

  it('rejects invalid reach-stage targets', () => {
    expect(service.addReachStage(0)).toBeFalse();
    expect(service.addReachStage(1.5)).toBeFalse();
    expect(service.blocks()).toEqual([]);
  });
});
