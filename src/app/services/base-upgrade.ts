import { effect, Injectable, signal } from '@angular/core';
import { UpgradeEffectType } from '../models/prestige.model';

export interface UpgradeSaveData {
  id: string;
  currentLevel: number;
}

@Injectable()
export abstract class BaseUpgradeService<T extends { id: string; currentLevel: number }> {
  protected upgrades = signal<T[]>([]);
  readonly allUpgrades = this.upgrades.asReadonly();

  protected init(getDefaultUpgrades: () => T[], query: any) {
    const defaultUpgrades = getDefaultUpgrades();

    effect(() => {
      const dbUpgrades = query.data();
      if (!dbUpgrades) return;

      const merged = defaultUpgrades.map((upgrade) => {
        const savedUpgrade = dbUpgrades.find((s: any) => s.id === upgrade.id);
        return {
          ...upgrade,
          currentLevel: savedUpgrade?.currentLevel ?? 0,
        };
      });

      this.upgrades.set(merged);
    });
  }

  protected abstract getCurrentCurrency(): number;
  protected abstract spendCurrency(amount: number): void;
  protected abstract updateDatabase(): void;

  calculateCost(upgrade: T & { baseCost: number; costScaling: number }): number {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScaling, upgrade.currentLevel));
  }

  canPurchase(upgradeID: string): boolean {
    const upgrade = this.getUpgradeByID(upgradeID) as any;
    if (!upgrade) return false;

    const cost = this.calculateCost(upgrade);
    const currency = this.getCurrentCurrency();

    return currency >= cost;
  }

  purchaseUpgrade(upgradeID: string): boolean {
    if (!this.canPurchase(upgradeID)) return false;

    const upgrade = this.getUpgradeByID(upgradeID) as any;
    const cost = this.calculateCost(upgrade);
    this.spendCurrency(cost);
    this.upgrades.update((upgrades) =>
      upgrades.map((u) => (u.id === upgradeID ? { ...u, currentLevel: u.currentLevel + 1 } : u))
    );

    this.updateDatabase();

    return true;
  }

  getUpgradeByID(upgradeID: string): T | undefined {
    return this.upgrades().find((upgrade) => upgrade.id === upgradeID);
  }

  getTotalEffect(effectType: UpgradeEffectType): number {
    return this.upgrades()
      .filter((u: any) => u.effectType === effectType)
      .reduce((total, upgrade: any) => {
        return total + this.calculateEffect(upgrade);
      }, 0);
  }

  calculateEffect(upgrade: any): number {
    switch (upgrade.effectScaling) {
      case 'linear':
        return upgrade.effectValue * upgrade.currentLevel;
      case 'exponential':
        return Math.pow(upgrade.effectValue, upgrade.currentLevel);
      case 'fixed_per_level':
        return upgrade.effectValue * (upgrade.currentLevel > 0 ? 1 : 0);
      default:
        return 0;
    }
  }
}
