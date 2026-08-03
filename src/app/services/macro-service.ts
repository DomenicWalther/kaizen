import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { CharacterService } from './character-service';
import { CombatService } from './combat-service';
import { PrestigeService } from './prestige-service';
import { MacroBlock } from '../models/macro.model';

export type MacroStatus = 'idle' | 'running' | 'completed' | 'stopped' | 'blocked';

@Injectable({
  providedIn: 'root',
})
export class MacroService implements OnDestroy {
  private readonly STORAGE_KEY = 'kaizen-macro';
  private readonly TICK_INTERVAL = 100;
  private nextBlockId = 0;
  private intervalId: number | undefined;
  private macroStartedCombat = false;
  private stageStallState: {
    blockId: string;
    lastObservedStage: number;
    lastProgressAt: number;
  } | null = null;

  readonly blocks = signal<MacroBlock[]>(this.loadBlocks());
  readonly isLooping = signal(false);
  readonly isRunning = signal(false);
  readonly status = signal<MacroStatus>('idle');
  readonly statusMessage = signal('Add a block to create a macro.');
  readonly activeBlockIndex = signal<number | null>(null);
  readonly activeBlock = computed(() => {
    const index = this.activeBlockIndex();
    return index === null ? null : (this.blocks()[index] ?? null);
  });

  constructor(
    private readonly characterService: CharacterService,
    private readonly combatService: CombatService,
    private readonly prestigeService: PrestigeService,
  ) {}

  addReachStage(targetStage: number): boolean {
    if (this.isRunning() || !this.isValidTarget(targetStage)) return false;

    this.blocks.update((blocks) => [
      ...blocks,
      {
        id: this.createBlockId(),
        type: 'reach-stage',
        targetStage,
      },
    ]);
    this.markEdited();
    return true;
  }

  addStageStall(seconds: number): boolean {
    if (this.isRunning() || !this.isValidStageStall(seconds)) return false;

    this.blocks.update((blocks) => [
      ...blocks,
      {
        id: this.createBlockId(),
        type: 'stage-stall',
        seconds,
      },
    ]);
    this.markEdited();
    return true;
  }

  addAscend(): boolean {
    if (this.isRunning()) return false;

    this.blocks.update((blocks) => [
      ...blocks,
      {
        id: this.createBlockId(),
        type: 'ascend',
      },
    ]);
    this.markEdited();
    return true;
  }

  removeBlock(index: number): boolean {
    if (this.isRunning() || !Number.isInteger(index) || index < 0 || index >= this.blocks().length) {
      return false;
    }

    this.blocks.update((blocks) => blocks.filter((_, blockIndex) => blockIndex !== index));
    this.markEdited();
    return true;
  }

  moveBlock(index: number, direction: -1 | 1): boolean {
    if (this.isRunning() || !Number.isInteger(index)) return false;

    const nextIndex = index + direction;
    if (index < 0 || index >= this.blocks().length || nextIndex < 0 || nextIndex >= this.blocks().length) {
      return false;
    }

    this.blocks.update((blocks) => {
      const reordered = [...blocks];
      [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
      return reordered;
    });
    this.markEdited();
    return true;
  }

  clear(): void {
    if (this.isRunning()) return;

    this.blocks.set([]);
    this.markEdited();
  }

  setLooping(enabled: boolean): void {
    if (this.isRunning()) return;

    this.isLooping.set(enabled);
    this.statusMessage.set(enabled ? 'Infinite loop enabled.' : 'Infinite loop disabled.');
  }

  start(): boolean {
    if (this.isRunning()) return false;

    if (this.blocks().length === 0) {
      this.status.set('blocked');
      this.statusMessage.set('Add at least one block before starting the macro.');
      return false;
    }

    this.activeBlockIndex.set(0);
    this.stageStallState = null;
    this.isRunning.set(true);
    this.status.set('running');
    this.macroStartedCombat = !this.combatService.isFighting();
    if (this.macroStartedCombat) this.combatService.startFighting();

    this.processCurrentBlock();
    if (this.isRunning()) {
      this.intervalId = setInterval(() => this.processCurrentBlock(), this.TICK_INTERVAL);
    }
    return true;
  }

  stop(): void {
    if (!this.isRunning()) return;

    this.stopRuntime('stopped', 'Macro stopped.');
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private processCurrentBlock(): void {
    if (!this.isRunning()) return;

    let steps = 0;
    while (this.isRunning() && steps <= this.blocks().length) {
      const index = this.activeBlockIndex();
      if (index === null) {
        this.stopRuntime('completed', 'Macro completed.');
        return;
      }
      const block = this.blocks()[index];
      if (!block) {
        if (this.isLooping()) {
          this.activeBlockIndex.set(0);
          this.statusMessage.set('Looping macro...');
          return;
        }
        this.stopRuntime('completed', 'Macro completed.');
        return;
      }

      steps++;
      if (block.type === 'reach-stage') {
        if (this.characterService.character().currentStage < block.targetStage) {
          this.statusMessage.set(`Waiting for Stage ${block.targetStage}.`);
          return;
        }

        this.activeBlockIndex.set(index + 1);
        continue;
      }

      if (block.type === 'stage-stall') {
        const currentStage = this.characterService.character().currentStage;
        const now = Date.now();

        if (this.stageStallState?.blockId !== block.id) {
          this.stageStallState = {
            blockId: block.id,
            lastObservedStage: currentStage,
            lastProgressAt: now,
          };
          this.statusMessage.set(`Waiting for no new Stage for ${block.seconds}s.`);
          return;
        }

        if (currentStage > this.stageStallState.lastObservedStage) {
          this.stageStallState.lastObservedStage = currentStage;
          this.stageStallState.lastProgressAt = now;
          this.statusMessage.set(`Stage ${currentStage} reached. Restarting stall timer.`);
          return;
        }

        if (now - this.stageStallState.lastProgressAt < block.seconds * 1000) {
          this.statusMessage.set(`Waiting for no new Stage for ${block.seconds}s.`);
          return;
        }

        this.stageStallState = null;
        this.activeBlockIndex.set(index + 1);
        continue;
      }

      if (this.prestigeService.calculatePrestigeCores() <= 0) {
        this.stopRuntime('blocked', 'Ascension is not available yet.');
        return;
      }

      this.statusMessage.set('Ascending...');
      this.prestigeService.prestige();
      this.activeBlockIndex.set(index + 1);
    }
  }

  private stopRuntime(status: MacroStatus, message: string): void {
    this.clearInterval();
    this.isRunning.set(false);
    this.activeBlockIndex.set(null);
    this.stageStallState = null;
    this.status.set(status);
    this.statusMessage.set(message);

    if (this.macroStartedCombat && this.combatService.isFighting()) {
      this.combatService.stopFighting();
    }
    this.macroStartedCombat = false;
  }

  private clearInterval(): void {
    if (this.intervalId === undefined) return;

    clearInterval(this.intervalId);
    this.intervalId = undefined;
  }

  private markEdited(): void {
    this.persistBlocks();
    this.status.set('idle');
    this.statusMessage.set(
      this.blocks().length > 0 ? 'Macro ready.' : 'Add a block to create a macro.',
    );
  }

  private createBlockId(): string {
    this.nextBlockId++;
    return `macro-block-${this.nextBlockId}`;
  }

  private isValidTarget(targetStage: number): boolean {
    return Number.isInteger(targetStage) && targetStage >= 1;
  }

  private isValidStageStall(seconds: number): boolean {
    return Number.isFinite(seconds) && seconds > 0;
  }

  private persistBlocks(): void {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.blocks()));
  }

  private loadBlocks(): MacroBlock[] {
    if (typeof localStorage === 'undefined') return [];

    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return [];

    try {
      const parsed: unknown = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter((block): block is MacroBlock => this.isMacroBlock(block)) : [];
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
      return [];
    }
  }

  private isMacroBlock(value: unknown): value is MacroBlock {
    if (!value || typeof value !== 'object') return false;

    const block = value as Record<string, unknown>;
    if (typeof block['id'] !== 'string') return false;
    if (block['type'] === 'ascend') return true;

    if (
      block['type'] === 'stage-stall' &&
      typeof block['seconds'] === 'number' &&
      Number.isFinite(block['seconds']) &&
      block['seconds'] > 0
    ) {
      return true;
    }

    return (
      block['type'] === 'reach-stage' &&
      typeof block['targetStage'] === 'number' &&
      Number.isInteger(block['targetStage']) &&
      block['targetStage'] >= 1
    );
  }
}
