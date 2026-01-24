import { Injectable } from '@angular/core';
import { BaseUpgradeService } from './base-upgrade';
import { Upgrade, UpgradeEffectType, UpgradeScalingType } from '../models/prestige.model';
import { injectMutation, injectQuery } from 'convex-angular';
import { api } from '../../../convex/_generated/api';
import { AlchemyDust } from '../models/character.model';

@Injectable({
  providedIn: 'root',
})
export class AlchemyService {
  private readonly databaseUpdateMutation = injectMutation(
    api.alchemyUpgrades.updateAlchemyUpgradeLevels,
  );
  constructor() {
    super();
    this.init(() => this.getAlchemyUpgradeDefinitions(), this.getUpgradesFromDatabase);
  }

  private getUpgradesFromDatabase = injectQuery(api.alchemyUpgrades.getAlchemyUpgrades, () => ({}));

  public override updateDatabase(): void {
    const upgradesToSave: { id: string; currentLevel: number }[] = this.upgrades().map(
      (upgrade) => ({
        id: upgrade.id,
        currentLevel: upgrade.currentLevel,
      }),
    );
    this.databaseUpdateMutation.mutate({ upgrades: upgradesToSave });
  }

  protected override getCurrentCurrency(): AlchemyDust {
    return {
      basic_dust: 0,
      advanced_dust: 0,
      improved_dust: 0,
    };
  }

  protected override spendCurrency(amount: number, cost: AlchemyDust): boolean {
    return true;
  }

  private getAlchemyUpgradeDefinitions(): Upgrade[] {
    return [
      {
        id: 'alchemy_strength_boost',
        name: 'Coke Dust',
        description: 'Increase Total Strength by 10%',
        baseCost: 100,
        costScaling: 5,
        effectType: UpgradeEffectType.FLAT_STAT_BOOST,
        effectValue: 0.1,
        effectScaling: UpgradeScalingType.LINEAR,
        currentLevel: 0,
      },
    ];
  }
}
