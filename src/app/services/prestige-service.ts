import { effect, inject, Injectable, signal } from '@angular/core';
import { CharacterService } from './character-service';
import { PrestigeUpgrade, UpgradeEffectType, UpgradeScalingType } from '../models/prestige.model';

@Injectable({
  providedIn: 'root',
})
export class PrestigeService {
  characterService = inject(CharacterService);

  constructor() {
    effect(() => {
      localStorage.setItem('prestigeUpgrades', JSON.stringify(this.upgrades()));
    });
  }

  private upgrades = signal<PrestigeUpgrade[]>(this.loadUpgrades());
  loadUpgrades(): PrestigeUpgrade[] {
    const saved = localStorage.getItem('prestigeUpgrades');
    if (saved) {
      return JSON.parse(saved);
    }
    return this.getDefaultUpgrades();
  }

  private getDefaultUpgrades(): PrestigeUpgrade[] {
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
        description: 'Increase strength multiplier by 0.1 per Level',
        baseCost: 1,
        costScaling: 1.8,
        effectType: UpgradeEffectType.FLAT_STAT_BOOST,
        effectValue: 0.1,
        effectScaling: UpgradeScalingType.LINEAR,
        currentLevel: 0,
      },
      {
        id: 'core_gain_boost',
        name: 'Kaizen Mastery',
        description: 'Increase Kaizen-Core gain by 10% per Level',
        baseCost: 1,
        costScaling: 2.0,
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

  calculateCost(upgrade: PrestigeUpgrade): number {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScaling, upgrade.currentLevel));
  }

  canPurchase(upgradeID: string): boolean {
    const upgrade = this.getUpgradeByID(upgradeID);
    if (!upgrade) return false;

    const cost = this.calculateCost(upgrade);
    const cores = this.characterService.character().prestigeCores;

    return cores >= cost;
  }

  getUpgradeByID(upgradeID: string): PrestigeUpgrade | undefined {
    return this.upgrades().find((upgrade) => upgrade.id === upgradeID);
  }

  purchaseUpgrade(upgradeID: string): boolean {
    if (!this.canPurchase(upgradeID)) return false;

    const upgrade = this.getUpgradeByID(upgradeID);
    const cost = this.calculateCost(upgrade!);

    this.characterService.spendPrestigeCores(cost);

    this.upgrades.update((upgrades) =>
      upgrades.map((u) => (u.id === upgradeID ? { ...u, currentLevel: u.currentLevel + 1 } : u))
    );
    return true;
  }
}
