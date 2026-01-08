import { inject, Injectable } from '@angular/core';
import { CharacterService } from './character-service';

@Injectable({
  providedIn: 'root',
})
export class CombatService {
  characterService = inject(CharacterService);

  calculateEnemyHP() {
    const character = this.characterService.character();
    const baseHP = 100;
    const stageMultiplier = 1.6;
    const waveMultiplier = 0.05;

    const stagePower = Math.pow(stageMultiplier, character.currentStage - 1);
    const wavePower = Math.pow(1 + waveMultiplier, character.currentWave - 1);
    return Math.floor(baseHP * stagePower * wavePower);
  }

  calculateDamage(): number {
    const character = this.characterService.character();
    return (
      character.baseStrength * character.strengthModifier * character.prestigeMultipliers.strength
    );
  }

  performAttack(currentHP: number): {
    remainingHP: number;
    defeated: boolean;
  } {
    let attackAmount = this.calculateDamage();
    const remainingHP = Math.max(0, currentHP - attackAmount);
    return {
      remainingHP,
      defeated: remainingHP === 0,
    };
  }
}
