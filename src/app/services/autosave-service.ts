import { Injectable } from '@angular/core';
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

  AUTO_SAVE_INTERVAL = 10000; // 5 minutes #TODO: FOR DEBUGGING 10S RIGHT NOW, CHANGE BACK TO 5 MIN

  constructor(private GameStateService: GameStateService) {}

  startAutoSave() {
    this.saveIntervalID = setInterval(() => {
      this.checkAndSave();
    }, this.AUTO_SAVE_INTERVAL);

    this.checkAndSave();
  }

  checkAndSave() {
    const currentGameState = this.GameStateService.getState();

    if (JSON.stringify(currentGameState) !== JSON.stringify(this.lastSavedGameState)) {
      console.log('Updated the Database!');

      console.log('Current Game State:', currentGameState);
      console.log('Previous Game State:', this.lastSavedGameState);

      this.lastSavedGameState = currentGameState;
    }
  }

  stopAutoSave() {
    if (this.saveIntervalID) {
      clearInterval(this.saveIntervalID);
    }
  }
}
