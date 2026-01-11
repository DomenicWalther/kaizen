import { inject, Injectable } from '@angular/core';
import { CharacterService } from './character-service';
import { PrestigeService } from './prestige-service';
import { UpgradeEffectType } from '../models/prestige.model';

@Injectable({
  providedIn: 'root',
})
export class CombatService {
  characterService = inject(CharacterService);
  prestigeService = inject(PrestigeService);

  calculateEnemyHP() {
    const character = this.characterService.character();
    const baseHP = 100;
    const stageMultiplier = 1.6;
    const waveMultiplier = 0.05;

    const stagePower = Math.pow(stageMultiplier, character.currentStage - 1);
    const wavePower = Math.pow(1 + waveMultiplier, character.currentWave - 1);
    let enemyHP = Math.floor(baseHP * stagePower * wavePower);
    const healthReduction = this.prestigeService.getTotalEffect(
      UpgradeEffectType.ENEMY_HEALTH_REDUCTION
    );

    enemyHP = Math.floor(enemyHP * (1 - healthReduction));
    return enemyHP;
  }

  calculateDamage(): number {
    const character = this.characterService.character();
    let damage =
      character.baseStrength * character.strengthModifier * character.prestigeMultipliers.strength;

    const strengthBoost = this.prestigeService.getTotalEffect(UpgradeEffectType.FLAT_STAT_BOOST);
    damage *= 1 + strengthBoost;

    const dpsPerCore = this.prestigeService.getTotalEffect(UpgradeEffectType.DYNAMIC_PER_CORE);
    const unusedCores = character.prestigeCores;
    damage *= 1 + dpsPerCore * unusedCores;
    return Math.floor(damage);
  }

  calculateAttackSpeed(): number {
    const baseAttackSpeed = 1000;
    const attackSpeedBoost = this.prestigeService.getTotalEffect(UpgradeEffectType.ATTACK_SPEED);
    const finalAttackSpeed = Math.floor(baseAttackSpeed * (1 - attackSpeedBoost));
    return finalAttackSpeed;
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

  calculateGoldReward(): number {
    const baseGold = 10 * this.characterService.character().currentStage;
    const waveBonusGold = 1 + this.characterService.character().currentWave * 0.05;

    let gold = baseGold * waveBonusGold;

    const critChance = 0.1;
    if (Math.random() < critChance) {
      gold *= 2;
    }
    return gold;
  }
}
