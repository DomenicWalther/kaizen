import { inject, Injectable } from '@angular/core';
import { CharacterService } from './character-service';
import { UpgradeEffectType } from '../models/prestige.model';
import { PrestigeUpgradeService } from './prestige-upgrade-service';

@Injectable({
  providedIn: 'root',
})
export class PrestigeService {
  characterService = inject(CharacterService);
  prestigeUgpradeService = inject(PrestigeUpgradeService);

  prestige() {
    const coresEarned = this.calculatePrestigeCores();
    this.characterService.resetCharacter();
    this.characterService.modifyStat('prestigeCores', coresEarned);
    this.characterService.modifyStat('prestigeLevel', 1);
  }

  calculatePrestigeCores() {
    if (this.characterService.character().currentStage < 20) return 0;
    const prestigeCoreGain = Math.floor(
      4 * Math.log10(this.characterService.character().currentStage)
    );
    const multiplier =
      1 + this.prestigeUgpradeService.getTotalEffect(UpgradeEffectType.MULTIPLIER_BOOST);
    return Math.floor(prestigeCoreGain * multiplier);
  }
}
