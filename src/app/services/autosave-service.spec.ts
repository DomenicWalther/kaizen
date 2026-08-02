import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AutoSaveService } from './autosave-service';
import { GameStateService } from './gamestate-service';

describe('AutoSaveService readiness', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('waits for character and both upgrade collections before saving', () => {
    const characterLoaded = signal(true);
    const goldUpgradesLoaded = signal(false);
    const prestigeUpgradesLoaded = signal(false);
    const gameStateService = {
      characterService: { hasLoadedFromDb: characterLoaded },
      goldUpgradeService: { hasLoadedFromDb: goldUpgradesLoaded },
      prestigeUpgradeService: { hasLoadedFromDb: prestigeUpgradesLoaded },
      hasLoadedFromDb: computed(
        () =>
          characterLoaded() && goldUpgradesLoaded() && prestigeUpgradesLoaded(),
      ),
      getState: () => ({ goldUpgrades: [], prestigeUpgrades: [], character: {} as never }),
      pushUpdatesToDatabase: () => Promise.resolve([]),
    };

    TestBed.configureTestingModule({
      providers: [
        AutoSaveService,
        { provide: GameStateService, useValue: gameStateService },
      ],
    });

    const service = TestBed.inject(AutoSaveService);

    expect(service.isReady()).toBeFalse();

    goldUpgradesLoaded.set(true);
    prestigeUpgradesLoaded.set(true);

    expect(service.isReady()).toBeTrue();
  });

  it('pushes the current state when manually requested', async () => {
    const pushUpdatesToDatabase = jasmine
      .createSpy('pushUpdatesToDatabase')
      .and.returnValue(Promise.resolve([]));
    const gameStateService = {
      characterService: { hasLoadedFromDb: signal(false) },
      goldUpgradeService: { hasLoadedFromDb: signal(false) },
      prestigeUpgradeService: { hasLoadedFromDb: signal(false) },
      hasLoadedFromDb: signal(false),
      getState: () => ({ goldUpgrades: [], prestigeUpgrades: [], character: {} as never }),
      pushUpdatesToDatabase,
    };

    TestBed.configureTestingModule({
      providers: [
        AutoSaveService,
        { provide: GameStateService, useValue: gameStateService },
      ],
    });

    await TestBed.inject(AutoSaveService).saveNow();

    expect(pushUpdatesToDatabase).toHaveBeenCalledTimes(1);
  });

  it('detects a changed Overkill level in the prestige upgrade state', async () => {
    let overkillLevel = 15;
    const pushUpdatesToDatabase = jasmine
      .createSpy('pushUpdatesToDatabase')
      .and.returnValue(Promise.resolve([]));
    const gameStateService = {
      characterService: { hasLoadedFromDb: signal(true) },
      goldUpgradeService: { hasLoadedFromDb: signal(true) },
      prestigeUpgradeService: { hasLoadedFromDb: signal(true) },
      hasLoadedFromDb: signal(true),
      getState: () => ({
        goldUpgrades: [],
        prestigeUpgrades: [{ id: 'overkill_stage', currentLevel: overkillLevel }],
        character: {} as never,
      }),
      pushUpdatesToDatabase,
    };

    TestBed.configureTestingModule({
      providers: [
        AutoSaveService,
        { provide: GameStateService, useValue: gameStateService },
      ],
    });

    const service = TestBed.inject(AutoSaveService);
    await service.saveNow();

    overkillLevel = 16;
    await service.checkAndSave();

    expect(pushUpdatesToDatabase).toHaveBeenCalledTimes(2);
  });
});
