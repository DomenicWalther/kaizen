import { Component, computed, inject, signal } from '@angular/core';
import { CharacterService } from '../../services/character-service';
import { PrestigeUpgradeService } from '../../services/prestige-upgrade-service';
import { GoldUpgradeService } from '../../services/gold-upgrade-service';
import { UpgradeCard } from './components/upgrade-card/upgrade-card';
import { BigDecimalFormat } from '../../shared/pipes/BigDecimalFormatthing.pipe';

@Component({
  selector: 'app-character',
  imports: [UpgradeCard, BigDecimalFormat],
  templateUrl: './character.html',
})
export class Character {
  selectedTab = signal<'neural' | 'core'>('neural');

  characterService = inject(CharacterService);
  prestigeUpgradeService = inject(PrestigeUpgradeService);
  goldUpgradeService = inject(GoldUpgradeService);
  get character() {
    return this.characterService.character;
  }

  prestigeUpgrades = computed(() => {
    return this.prestigeUpgradeService.allUpgrades().map((upgrade) => ({
      upgrade,
      currentCost: this.prestigeUpgradeService.calculateCost(upgrade),
      totalEffect: this.prestigeUpgradeService.calculateEffect(upgrade),
      canPurchase: this.prestigeUpgradeService.canPurchase(upgrade.id),
    }));
  });

  goldUpgrades = computed(() => {
    return this.goldUpgradeService.allUpgrades().map((upgrade) => ({
      upgrade,
      currentCost: this.goldUpgradeService.calculateCost(upgrade),
      totalEffect: this.goldUpgradeService.calculateEffect(upgrade),
      canPurchase: this.goldUpgradeService.canPurchase(upgrade.id),
    }));
  });

  onGoldPurchaseUpgrade(upgradeId: string) {
    this.goldUpgradeService.purchaseUpgrade(upgradeId);
  }

  onPrestigePurchaseUpgrade(upgradeId: string) {
    this.prestigeUpgradeService.purchaseUpgrade(upgradeId);
  }

  selectTab(tab: 'neural' | 'core') {
    this.selectedTab.set(tab);
  }
}
