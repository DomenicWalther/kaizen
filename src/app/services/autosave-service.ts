import { effect, Injectable } from '@angular/core';
import { GameStateService } from './gamestate-service';
import { Upgrade } from '../models/prestige.model';

export interface GameState {
  goldUpgrades: Upgrade[];
  prestigeUpgrades: Upgrade[];
}

@Injectable({
  providedIn: 'root',
})
export class AutoSaveService {
  private saveIntervalID: number | undefined;
  private lastSavedGameState: GameState | undefined;
  private autoSaveHasStarted = false;

  AUTO_SAVE_INTERVAL = 300000; // 5 minutes #TODO: FOR DEBUGGING 10S RIGHT NOW, CHANGE BACK TO 5 MIN

  constructor(private GameStateService: GameStateService) {
    effect(() => {
      if (this.autoSaveHasStarted) return;
      if (this.GameStateService.characterService.hasLoadedFromDb()) {
        this.startAutoSave();
        this.autoSaveHasStarted = true;
      }
    });
  }

  startAutoSave() {
    this.saveIntervalID = setInterval(() => {
      this.checkAndSave();
    }, this.AUTO_SAVE_INTERVAL);

    this.checkAndSave();
  }

  checkAndSave() {
    const currentGameState = this.GameStateService.getState();

    if (JSON.stringify(currentGameState) !== JSON.stringify(this.lastSavedGameState)) {
      this.GameStateService.pushUpdatesToDatabase();
      console.log('Pushing Updates to Database!');

      this.lastSavedGameState = currentGameState;
    }
  }

  stopAutoSave() {
    if (this.saveIntervalID) {
      clearInterval(this.saveIntervalID);
    }
  }
}
