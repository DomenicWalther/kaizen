import { Component, computed, inject } from '@angular/core';
import { CharacterService } from '../../services/character-service';
import { PrestigeUpgradeService } from '../../services/prestige-upgrade-service';
import { GoldUpgradeService } from '../../services/gold-upgrade-service';
import { UpgradeCard } from './components/upgrade-card/upgrade-card';

@Component({
  selector: 'app-character',
  imports: [UpgradeCard],
  templateUrl: './character.html',
})
export class Character {
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
    }));
  });

  goldUpgrades = computed(() => {
    return this.goldUpgradeService.allUpgrades().map((upgrade) => ({
      upgrade,
      currentCost: this.goldUpgradeService.calculateCost(upgrade),
      totalEffect: this.goldUpgradeService.calculateEffect(upgrade),
    }));
  });

  onGoldPurchaseUpgrade(upgradeId: string) {
    this.goldUpgradeService.purchaseUpgrade(upgradeId);
  }

  onPrestigePurchaseUpgrade(upgradeId: string) {
    this.prestigeUpgradeService.purchaseUpgrade(upgradeId);
  }
}
