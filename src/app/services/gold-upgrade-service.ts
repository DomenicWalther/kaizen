import { effect, inject, Injectable, signal } from '@angular/core';
import { BaseUpgradeService } from './base-upgrade';
import { Upgrade, UpgradeEffectType, UpgradeScalingType } from '../models/prestige.model';
import { CharacterService } from './character-service';
import { api } from '../../../convex/_generated/api';
import { injectMutation, injectQuery } from 'convex-angular';
import { ClerkService } from './clerk.service';

@Injectable({
  providedIn: 'root',
})
export class GoldUpgradeService extends BaseUpgradeService<Upgrade> {
  private characterService = inject(CharacterService);
  private clerkService = inject(ClerkService);
  private activeUserId = signal<string | null>(null);

  private databaseUpdateMutation = injectMutation(api.goldUpgrades.updateGoldUpgradeLevels);
  constructor() {
    super();
    effect(() => {
      const userId = this.clerkService.user()?.id ?? null;
      if (this.activeUserId() === userId) return;

      this.activeUserId.set(userId);
      this.hasLoadedFromDb.set(false);
      this.upgrades.set([]);
    });

    this.init(() => this.getGoldUpgradeDefinitions(), this.getUpgradesFromDatabase);
  }

  private getUpgradesFromDatabase = injectQuery(api.goldUpgrades.getGoldUpgrades, () => ({}));

  protected override getCurrentCurrency(): number {
    return this.characterService.character().gold;
  }

  public override updateDatabase(): Promise<void> {
    const upgradesToSave = this.getUpgradeSaveData();
    return this.saveUpgradeData(upgradesToSave);
  }

  private async saveUpgradeData(upgrades: { id: string; currentLevel: number }[]): Promise<void> {
    await this.databaseUpdateMutation.mutate({ upgrades });

    const error = this.databaseUpdateMutation.error();
    if (error) throw error;
  }
  protected override spendCurrency(amount: number) {
    this.characterService.spendGold(amount);
  }

  private getGoldUpgradeDefinitions(): Upgrade[] {
    return [
      {
        id: 'gold_strength_flat',
        name: 'Noob Gains',
        description: 'Gain 1 Strength per Level',
        baseCost: 1,
        costScaling: 1.3,
        effectType: UpgradeEffectType.FLAT_STAT_BOOST,
        effectValue: 1,
        effectScaling: UpgradeScalingType.LINEAR,
        currentLevel: 0,
      },
      {
        id: 'gold_strength_stronger',
        name: 'Professional Kaizen Trainer',
        description: 'Gain 10 Strength per Level',
        baseCost: 10,
        costScaling: 1.5,
        effectType: UpgradeEffectType.FLAT_STAT_BOOST,
        effectValue: 10,
        effectScaling: UpgradeScalingType.LINEAR,
        currentLevel: 0,
      },
      {
        id: 'gold_critical_chance_basic',
        name: 'KaaChow Statue',
        description: 'Gain 1% additive Critical Chance per Level',
        baseCost: 50,
        costScaling: 1.2,
        effectType: UpgradeEffectType.CRITICAL_CHANCE_BOOST,
        effectValue: 0.01,
        effectScaling: UpgradeScalingType.LINEAR,
        currentLevel: 0,
      },
      {
        id: 'gold_critical_damage_basic',
        name: 'Heavy Hitter',
        description: 'Gain 5% additive Critical Damage per Level',
        baseCost: 50,
        costScaling: 1.2,
        effectType: UpgradeEffectType.CRITICAL_DAMAGE_BOOST,
        effectValue: 0.05,
        effectScaling: UpgradeScalingType.LINEAR,
        currentLevel: 0,
      },
    ];
  }
}
