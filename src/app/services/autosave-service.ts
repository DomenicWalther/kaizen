import { computed, effect, Injectable, signal } from '@angular/core';
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
  private saveTimerID: number | undefined;
  private countdownIntervalID: number | undefined;
  private lastSavedStateDigest: string | undefined;
  private autoSaveHasStarted = false;
  private saveInProgress: Promise<void> | null = null;
  private nextAutoSaveAt = signal<number | null>(null);
  private remainingUntilNextAutoSave = signal<number | null>(null);

  readonly AUTO_SAVE_INTERVAL = 5 * 60 * 1000;
  readonly isSaving = signal(false);
  readonly saveStatus = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');
  readonly timeUntilNextAutoSave = computed(() => {
    if (this.isSaving()) return 'SAVING...';

    const remainingMilliseconds = this.remainingUntilNextAutoSave();
    if (remainingMilliseconds === null) return this.isReady() ? 'PENDING' : 'WAITING';

    const remainingSeconds = Math.max(0, Math.ceil(remainingMilliseconds / 1000));
    const minutes = Math.floor(remainingSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (remainingSeconds % 60).toString().padStart(2, '0');

    return `${minutes}:${seconds}`;
  });

  constructor(private readonly gameStateService: GameStateService) {
    effect(() => {
      if (this.autoSaveHasStarted) return;
      if (this.gameStateService.hasLoadedFromDb()) {
        this.startAutoSave();
        this.autoSaveHasStarted = true;
      }
    });
  }

  startAutoSave() {
    if (this.autoSaveHasStarted) return;

    this.autoSaveHasStarted = true;
    this.countdownIntervalID = setInterval(() => this.updateCountdown(), 1000);
    this.resetAutoSaveTimer();
    void this.checkAndSave().catch(() => undefined);
  }

  checkAndSave(): Promise<void> {
    if (this.saveInProgress) return this.saveInProgress;

    const currentStateDigest = this.createStateDigest(this.gameStateService.getState());

    if (currentStateDigest === this.lastSavedStateDigest) {
      this.resetAutoSaveTimer();
      return Promise.resolve();
    }

    return this.pushCurrentState(currentStateDigest);
  }

  saveNow(): Promise<void> {
    const currentStateDigest = this.createStateDigest(this.gameStateService.getState());
    return this.pushCurrentState(currentStateDigest);
  }

  private pushCurrentState(currentStateDigest: string): Promise<void> {
    if (this.saveInProgress) return this.saveInProgress;

    this.isSaving.set(true);
    this.saveStatus.set('saving');
    this.nextAutoSaveAt.set(null);
    this.remainingUntilNextAutoSave.set(null);

    const savePromise = this.gameStateService.pushUpdatesToDatabase()
      .then(() => {
        this.lastSavedStateDigest = currentStateDigest;
        this.saveStatus.set('saved');
        this.resetAutoSaveTimer();
      })
      .catch((error: unknown) => {
        this.saveStatus.set('error');
        this.resetAutoSaveTimer();
        throw error;
      })
      .finally(() => {
        this.isSaving.set(false);
        this.saveInProgress = null;
      });

    this.saveInProgress = savePromise;
    return savePromise;
  }

  get isReady() {
    return this.gameStateService.hasLoadedFromDb;
  }

  private resetAutoSaveTimer() {
    if (!this.autoSaveHasStarted) return;

    if (this.saveTimerID !== undefined) {
      clearTimeout(this.saveTimerID);
    }

    const nextSaveAt = Date.now() + this.AUTO_SAVE_INTERVAL;
    this.nextAutoSaveAt.set(nextSaveAt);
    this.remainingUntilNextAutoSave.set(nextSaveAt - Date.now());
    this.saveTimerID = setTimeout(() => {
      void this.checkAndSave().catch(() => undefined);
    }, this.AUTO_SAVE_INTERVAL);
  }

  private updateCountdown() {
    const nextSaveAt = this.nextAutoSaveAt();
    if (nextSaveAt === null) return;

    const remainingMilliseconds = Math.max(0, nextSaveAt - Date.now());
    this.remainingUntilNextAutoSave.set(remainingMilliseconds);
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
    if (this.saveTimerID !== undefined) {
      clearTimeout(this.saveTimerID);
      this.saveTimerID = undefined;
    }

    if (this.countdownIntervalID) {
      clearInterval(this.countdownIntervalID);
      this.countdownIntervalID = undefined;
    }
  }
}
