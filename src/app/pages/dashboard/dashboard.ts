import { Component, inject } from '@angular/core';
import { CharacterService } from '../../services/character';
import { Character } from '../../models/character.model';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  characterService = inject(CharacterService);
  get character() {
    return this.characterService.character;
  }

  modifyStat(
    stat: keyof Pick<
      Character,
      'level' | 'baseStrength' | 'baseIntelligence' | 'baseEndurance' | 'gold'
    >,
    amount: number
  ) {
    this.characterService.modifyStat(stat, amount);
  }

  resetCharacter() {
    this.characterService.resetCharacter();
  }
}
