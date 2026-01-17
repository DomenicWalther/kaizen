import { Injectable } from '@angular/core';
import { GoldUpgradeService } from './gold-upgrade-service';
import { PrestigeUpgradeService } from './prestige-upgrade-service';
import { CharacterService } from './character-service';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  constructor(
    private goldUpgradeService: GoldUpgradeService,
    private prestigeUpgradeService: PrestigeUpgradeService
  ) // private characterService: CharacterService
  {}

  getState() {
    return {
      goldUpgrades: this.goldUpgradeService.allUpgrades(),
      prestigeUpgrades: this.prestigeUpgradeService.allUpgrades(),
    };
  }
}
