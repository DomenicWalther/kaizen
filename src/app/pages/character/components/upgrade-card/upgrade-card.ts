import { Component, computed, input, output } from '@angular/core';
import {
  calculateUpgradeEffect,
  Upgrade,
  UpgradeEffectType,
} from '../../../../models/prestige.model';
import { BigDecimalFormat } from '../../../../shared/pipes/BigDecimalFormatthing.pipe';

@Component({
  selector: 'app-upgrade-card',
  imports: [BigDecimalFormat],
  templateUrl: './upgrade-card.html',
  styles: ``,
})
export class UpgradeCard {
  upgrade = input.required<Upgrade>();
  label = input.required<string>();
  currentCost = input.required<number>();
  totalEffect = input.required<number>();
  canPurchase = input.required<boolean>();
  purchase = output<void>();

  effectPerLevel = computed(() => this.formatEffect(this.upgrade().effectValue));
  currentEffect = computed(() => this.formatEffect(this.totalEffect()));
  nextEffect = computed(() => {
    const upgrade = this.upgrade();
    return this.formatEffect(this.calculateEffectAtLevel(upgrade.currentLevel + 1));
  });

  private calculateEffectAtLevel(level: number): number {
    const upgrade = this.upgrade();
    return calculateUpgradeEffect(upgrade.effectValue, upgrade.effectScaling, level);
  }

  private formatEffect(value: number): string {
    const upgrade = this.upgrade();
    const formattedValue = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(value);

    switch (upgrade.effectType) {
      case UpgradeEffectType.FLAT_STAT_BOOST:
        return upgrade.id.startsWith('gold_')
          ? `+${formattedValue} STR`
          : `+${this.formatPercent(value)} DMG`;
      case UpgradeEffectType.CRITICAL_CHANCE_BOOST:
        return `+${this.formatPercent(value)} CRIT CHANCE`;
      case UpgradeEffectType.CRITICAL_DAMAGE_BOOST:
        return `+${this.formatPercent(value)} CRIT DAMAGE`;
      case UpgradeEffectType.ATTACK_SPEED:
        return `-${this.formatPercent(value)} ATTACK INTERVAL`;
      case UpgradeEffectType.MULTIPLIER_BOOST:
        return `+${this.formatPercent(value)} CORE GAIN`;
      case UpgradeEffectType.ENEMY_HEALTH_REDUCTION:
        return `-${this.formatPercent(value)} ENEMY HP`;
      case UpgradeEffectType.OVERKILL_WAVE:
        return `+${formattedValue} WAVE`;
      case UpgradeEffectType.DYNAMIC_PER_CORE:
        return `+${this.formatPercent(value)} DMG / CORE`;
      default:
        return `+${formattedValue}`;
    }
  }

  private formatPercent(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      maximumFractionDigits: 2,
    }).format(value);
  }
}
