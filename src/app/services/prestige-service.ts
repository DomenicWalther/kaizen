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
    const currentStage = this.characterService.character().currentStage;
    if (currentStage < 20) return 0;
    const BASE = 10;
    const GROWTH_RATE = 1.26;
    const baseCores = Math.floor(BASE * Math.pow(GROWTH_RATE, currentStage - 20));
    const multiplier =
      1 + this.prestigeUgpradeService.getTotalEffect(UpgradeEffectType.MULTIPLIER_BOOST);
    return Math.floor(baseCores * multiplier);
  }
}
