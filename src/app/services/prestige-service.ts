import { effect, inject, Injectable, signal } from '@angular/core';
import { CharacterService } from './character-service';
import { PrestigeUpgrade, UpgradeEffectType, UpgradeScalingType } from '../models/prestige.model';

interface UpgradeSaveData {
  id: string;
  currentLevel: number;
}

@Injectable({
  providedIn: 'root',
})
export class PrestigeService {
  characterService = inject(CharacterService);

  constructor() {
    effect(() => {
      const saveData = this.upgrades().map((upgrade) => ({
        id: upgrade.id,
        currentLevel: upgrade.currentLevel,
      }));
      localStorage.setItem('prestigeUpgrades', JSON.stringify(saveData));
    });
  }

  private upgrades = signal<PrestigeUpgrade[]>(this.loadUpgrades());
  readonly allUpgrades = this.upgrades.asReadonly();
  loadUpgrades(): PrestigeUpgrade[] {
    const defaultUpgrades = this.getDefaultUpgrades();
    const saved = localStorage.getItem('prestigeUpgrades');
    if (!saved) {
      return defaultUpgrades;
    }
    const savedProgresss: UpgradeSaveData[] = JSON.parse(saved);

    return defaultUpgrades.map((upgrade) => {
      const savedUpgrade = savedProgresss.find((s) => s.id === upgrade.id);
      return {
        ...upgrade,
        currentLevel: savedUpgrade?.currentLevel ?? 0,
      };
    });
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

  getTotalEffect(effectType: UpgradeEffectType): number {
    return this.upgrades()
      .filter((u) => u.effectType === effectType)
      .reduce((total, upgrade) => {
        return total + this.calculateEffect(upgrade);
      }, 0);
  }

  private calculateEffect(upgrade: PrestigeUpgrade): number {
    switch (upgrade.effectScaling) {
      case UpgradeScalingType.LINEAR:
        return upgrade.effectValue * upgrade.currentLevel;
      case UpgradeScalingType.EXPONENTIAL:
        return Math.pow(upgrade.effectValue, upgrade.currentLevel);
      case UpgradeScalingType.FIXED_PER_LEVEL:
        return upgrade.effectValue * (upgrade.currentLevel > 0 ? 1 : 0);
      default:
        return 0;
    }
  }
  prestige() {
    const coresEarned = this.calculatePrestigeCores();
    this.characterService.resetCharacter();
    this.characterService.modifyStat('prestigeCores', coresEarned);
    this.characterService.modifyStat('prestigeLevel', 1);
  }

  calculatePrestigeCores() {
    if (this.characterService.character().currentStage < 20) return 0;
    const prestigeCoreGain = Math.floor(
      4 * Math.log10(this.characterService.character().currentStage)
    );
    const multiplier = 1 + this.getTotalEffect(UpgradeEffectType.MULTIPLIER_BOOST);
    return Math.floor(prestigeCoreGain * multiplier);
  }
}
