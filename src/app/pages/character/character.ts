import { Component, computed, inject } from '@angular/core';
import { CharacterService } from '../../services/character-service';
import { PrestigeUpgradeCard } from '../../components/prestige-upgrade-card/prestige-upgrade-card';
import { PrestigeService } from '../../services/prestige-service';

@Component({
  selector: 'app-character',
  imports: [PrestigeUpgradeCard],
  templateUrl: './character.html',
})
export class Character {
  characterService = inject(CharacterService);
  prestigeService = inject(PrestigeService);
  get character() {
    return this.characterService.character;
  }

  upgradesWithCalculations = computed(() => {
    return this.prestigeService.allUpgrades().map((upgrade) => ({
      upgrade,
      currentCost: this.prestigeService.calculateCost(upgrade),
      totalEffect: this.prestigeService.getTotalEffect(upgrade.effectType),
    }));
  });

  onPurchaseUpgrade(upgradeId: string) {
    this.prestigeService.purchaseUpgrade(upgradeId);
  }
}
