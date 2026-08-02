import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CharacterService } from './character-service';
import { AutoSaveService } from './autosave-service';
import { PrestigeService } from './prestige-service';
import { PrestigeUpgradeService } from './prestige-upgrade-service';

describe('PrestigeService', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('saves after applying the ascension changes', () => {
    const calls: string[] = [];
    const characterService = {
      character: signal({ currentStage: 20 }),
      resetCharacter: jasmine.createSpy('resetCharacter').and.callFake(() => calls.push('reset')),
      modifyStat: jasmine
        .createSpy('modifyStat')
        .and.callFake(() => calls.push('modify')),
    };
    const prestigeUpgradeService = {
      getTotalEffect: jasmine.createSpy('getTotalEffect').and.returnValue(0),
    };
    const autoSaveService = {
      saveNow: jasmine.createSpy('saveNow').and.callFake(() => {
        calls.push('save');
        return Promise.resolve();
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        PrestigeService,
        { provide: CharacterService, useValue: characterService },
        { provide: PrestigeUpgradeService, useValue: prestigeUpgradeService },
        { provide: AutoSaveService, useValue: autoSaveService },
      ],
    });

    TestBed.inject(PrestigeService).prestige();

    expect(calls).toEqual(['reset', 'modify', 'modify', 'save']);
  });
});
