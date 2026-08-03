import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AutoSaveService } from '../../services/autosave-service';
import { CharacterService } from '../../services/character-service';
import { GoldUpgradeService } from '../../services/gold-upgrade-service';
import { PrestigeUpgradeService } from '../../services/prestige-upgrade-service';
import { Upgrade } from '../../models/prestige.model';

@Component({
  selector: 'app-debug-menu',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './debug-menu.html',
})
export class DebugMenu {
  readonly autoSaveService = inject(AutoSaveService);
  private readonly characterService = inject(CharacterService);
  readonly goldUpgradeService = inject(GoldUpgradeService);
  readonly prestigeUpgradeService = inject(PrestigeUpgradeService);

  readonly isOpen = signal(false);
  readonly resetRequested = signal(false);
  readonly isSaving = signal(false);
  readonly message = signal<string | null>(null);
  readonly messageType = signal<'success' | 'error'>('success');
  readonly levelDrafts = signal<Record<string, string>>({});

  open() {
    this.syncDrafts();
    this.resetRequested.set(false);
    this.message.set(null);
    this.isOpen.set(true);
  }

  close() {
    if (this.isSaving()) return;

    this.isOpen.set(false);
    this.resetRequested.set(false);
  }

  setLevelDraft(upgradeId: string, value: string) {
    this.levelDrafts.update((drafts) => ({ ...drafts, [upgradeId]: value }));
  }

  levelDraft(upgrade: Upgrade): string {
    return this.levelDrafts()[upgrade.id] ?? String(upgrade.currentLevel);
  }

  requestReset() {
    this.resetRequested.set(true);
    this.message.set(null);
  }

  async applyLevels() {
    if (this.isSaving()) return;

    for (const upgrade of this.goldUpgradeService.allUpgrades()) {
      this.goldUpgradeService.setUpgradeLevel(
        upgrade.id,
        this.normalizeLevel(this.levelDraft(upgrade)),
      );
    }
    for (const upgrade of this.prestigeUpgradeService.allUpgrades()) {
      this.prestigeUpgradeService.setUpgradeLevel(
        upgrade.id,
        this.normalizeLevel(this.levelDraft(upgrade)),
      );
    }

    this.syncDrafts();
    await this.persist('UPGRADE LEVELS APPLIED');
  }

  async resetAllProgress() {
    if (this.isSaving()) return;

    this.characterService.resetProgress();
    this.goldUpgradeService.resetUpgrades();
    this.prestigeUpgradeService.resetUpgrades();
    this.syncDrafts();
    this.resetRequested.set(false);
    await this.persist('ALL PROGRESS RESET');
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) this.close();
  }

  private async persist(successMessage: string) {
    this.isSaving.set(true);
    this.message.set(null);

    try {
      await this.autoSaveService.saveNow();
      this.messageType.set('success');
      this.message.set(successMessage);
    } catch {
      this.messageType.set('error');
      this.message.set('LOCAL CHANGES KEPT // SAVE FAILED');
    } finally {
      this.isSaving.set(false);
    }
  }

  private syncDrafts() {
    const drafts: Record<string, string> = {};
    for (const upgrade of [
      ...this.goldUpgradeService.allUpgrades(),
      ...this.prestigeUpgradeService.allUpgrades(),
    ]) {
      drafts[upgrade.id] = String(upgrade.currentLevel);
    }
    this.levelDrafts.set(drafts);
  }

  private normalizeLevel(value: string): number {
    const level = Number(value);
    return Number.isFinite(level) ? Math.max(0, Math.floor(level)) : 0;
  }
}
