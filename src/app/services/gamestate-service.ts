import { Injectable } from '@angular/core';
import { GoldUpgradeService } from './gold-upgrade-service';
import { PrestigeUpgradeService } from './prestige-upgrade-service';
import { CharacterService } from './character-service';
import { Character } from '../models/character.model';
import { Upgrade } from '../models/prestige.model';

export interface GameState {
  goldUpgrades: Upgrade[];
  prestigeUpgrades: Upgrade[];
  character: Character;
}
@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  constructor(
    public goldUpgradeService: GoldUpgradeService,
    public prestigeUpgradeService: PrestigeUpgradeService,
    public characterService: CharacterService,
  ) {}

  getState(): GameState {
    return {
      goldUpgrades: this.goldUpgradeService.allUpgrades(),
      prestigeUpgrades: this.prestigeUpgradeService.allUpgrades(),
      character: this.characterService.character(),
    };
  }

  pushUpdatesToDatabase() {
    this.goldUpgradeService.updateDatabase();
    this.prestigeUpgradeService.updateDatabase();
    this.characterService.updateDatabase();
  }
}
