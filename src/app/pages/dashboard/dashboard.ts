import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CharacterService } from '../../services/character-service';
import { Character } from '../../models/character.model';

@Component({
  selector: 'app-dashboard',
  imports: [],
  changeDetection: ChangeDetectionStrategy.Eager,
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
    amount: number,
  ) {
    this.characterService.modifyStat(stat, amount);
  }

  resetCharacter() {
    this.characterService.resetCharacter();
  }
}
