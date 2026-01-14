import { inject, Injectable, Signal } from '@angular/core';
import { BaseUpgradeService } from './base-upgrade';
import { Upgrade, UpgradeEffectType, UpgradeScalingType } from '../models/prestige.model';
import { CharacterService } from './character-service';
import { api } from '../../../convex/_generated/api';
import { injectQuery } from 'convex-angular';
@Injectable({
  providedIn: 'root',
})
export class PrestigeUpgradeService extends BaseUpgradeService<Upgrade> {
  private readonly characterService = inject(CharacterService);

  constructor() {
    super();
    this.init(() => this.getPrestigeUpgradeDefinitions(), this.getUpgradesFromDatabase);
  }

  private getUpgradesFromDatabase = injectQuery(
    api.prestigeUpgrades.getPrestigeUpgrades,
    () => ({})
  );

  protected override getCurrentCurrency(): number {
    return this.characterService.character().prestigeCores;
  }

  protected override spendCurrency(amount: number): void {
    this.characterService.spendPrestigeCores(amount);
  }

  private getPrestigeUpgradeDefinitions(): Upgrade[] {
    return [
      {
        id: 'attack_speed_boost',
        name: 'Swift Strikes',
        description: 'Reduce attack interval by 5% per Level',
        baseCost: 1,
        costScaling: 2,
        effectType: UpgradeEffectType.ATTACK_SPEED,
        effectValue: 0.05,
        effectScaling: UpgradeScalingType.LINEAR,
        currentLevel: 0,
      },
      {
        id: 'strength_multiplier',
        name: 'Titans Power',
        description: 'Increase strength by 1 per Level',
        baseCost: 1,
        costScaling: 1.8,
        effectType: UpgradeEffectType.FLAT_STAT_BOOST,
        effectValue: 1,
        effectScaling: UpgradeScalingType.LINEAR,
        currentLevel: 0,
      },
      {
        id: 'core_gain_boost',
        name: 'Kaizen Mastery',
        description: 'Increase Kaizen-Core gain by 10% per Level',
        baseCost: 1,
        costScaling: 2,
        effectType: UpgradeEffectType.MULTIPLIER_BOOST,
        effectValue: 0.1,
        effectScaling: UpgradeScalingType.LINEAR,
        currentLevel: 0,
      },
      {
        id: 'enemy_health_reduction',
        name: 'Fragile Foes',
        description: 'Reduce enemy health by 5% per Level',
        baseCost: 1,
        costScaling: 1.6,
        effectType: UpgradeEffectType.ENEMY_HEALTH_REDUCTION,
        effectValue: 0.05,
        effectScaling: UpgradeScalingType.LINEAR,
        currentLevel: 0,
      },
      {
        id: 'dps_per_core',
        name: 'Hoarded Power',
        description: 'Gain %2 DPS per unused Kaizen-Core',
        baseCost: 1,
        costScaling: 2.5,
        effectType: UpgradeEffectType.DYNAMIC_PER_CORE,
        effectValue: 0.02,
        effectScaling: UpgradeScalingType.LINEAR,
        currentLevel: 0,
      },
    ];
  }
}
