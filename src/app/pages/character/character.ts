import { Component, inject } from '@angular/core';
import { CharacterService } from '../../services/character';
import { PrestigeUpgradeCard } from '../../components/prestige-upgrade-card/prestige-upgrade-card';

@Component({
  selector: 'app-character',
  imports: [PrestigeUpgradeCard],
  templateUrl: './character.html',
})
export class Character {
  characterService = inject(CharacterService);

  get character() {
    return this.characterService.character;
  }
}
