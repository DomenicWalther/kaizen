import { effect, Injectable } from '@angular/core';
import { GameStateService } from './gamestate-service';
import { Upgrade } from '../models/prestige.model';
import { Character } from '../models/character.model';

export interface GameState {
  goldUpgrades: Upgrade[];
  prestigeUpgrades: Upgrade[];
  character: Character;
}

@Injectable({
  providedIn: 'root',
})
export class AutoSaveService {
  private saveIntervalID: number | undefined;
  private lastSavedStateDigest: string | undefined;
  private autoSaveHasStarted = false;

  readonly AUTO_SAVE_INTERVAL = 5 * 60 * 1000;

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
    const currentStateDigest = this.createStateDigest(this.GameStateService.getState());

    if (currentStateDigest !== this.lastSavedStateDigest) {
      this.GameStateService.pushUpdatesToDatabase();
      this.lastSavedStateDigest = currentStateDigest;
    }
  }

  private createStateDigest(state: GameState): string {
    return JSON.stringify({
      character: {
        id: state.character.id,
        prestigeLevel: state.character.prestigeLevel,
        prestigeMultipliers: state.character.prestigeMultipliers,
        prestigeCores: state.character.prestigeCores,
        gold: state.character.gold,
        currentStage: state.character.currentStage,
        currentWave: state.character.currentWave,
      },
      goldUpgrades: state.goldUpgrades.map((upgrade) => ({
        id: upgrade.id,
        currentLevel: upgrade.currentLevel,
      })),
      prestigeUpgrades: state.prestigeUpgrades.map((upgrade) => ({
        id: upgrade.id,
        currentLevel: upgrade.currentLevel,
      })),
    });
  }

  stopAutoSave() {
    if (this.saveIntervalID) {
      clearInterval(this.saveIntervalID);
    }
  }
}
