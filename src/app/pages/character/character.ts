import { Component, computed, inject } from '@angular/core';
import { CharacterService } from '../../services/character-service';
import { PrestigeUpgradeCard } from '../../components/prestige-upgrade-card/prestige-upgrade-card';
import { PrestigeUpgradeService } from '../../services/prestige-upgrade-service';
import { GoldUpgradeService } from '../../services/gold-upgrade-service';

@Component({
  selector: 'app-character',
  imports: [PrestigeUpgradeCard],
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
    return this.prestigeUpgradeService.allUpgrades().map((upgrade: any) => ({
      upgrade,
      currentCost: this.prestigeUpgradeService.calculateCost(upgrade),
      totalEffect: this.prestigeUpgradeService.getTotalEffect(upgrade.effectType),
    }));
  });

  goldUpgrades = computed(() => {
    console.log('Recomputing gold upgrades', this.goldUpgradeService.allUpgrades());
    return this.goldUpgradeService.allUpgrades().map((upgrade: any) => ({
      upgrade,
      currentCost: this.goldUpgradeService.calculateCost(upgrade),
      totalEffect: this.goldUpgradeService.getTotalEffect(upgrade.effectType),
    }));
  });

  onGoldPurchaseUpgrade(upgradeId: string) {
    this.goldUpgradeService.purchaseUpgrade(upgradeId);
  }

  onPrestigePurchaseUpgrade(upgradeId: string) {
    this.prestigeUpgradeService.purchaseUpgrade(upgradeId);
  }
}
