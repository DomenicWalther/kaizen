import { inject, Injectable, signal } from '@angular/core';
import { CharacterService } from './character-service';
import { UpgradeEffectType } from '../models/prestige.model';
import { PrestigeUpgradeService } from './prestige-upgrade-service';
import { GoldUpgradeService } from './gold-upgrade-service';

@Injectable({
  providedIn: 'root',
})
export class CombatService {
  characterService = inject(CharacterService);
  prestigeUpgradeService = inject(PrestigeUpgradeService);
  goldUpgradeService = inject(GoldUpgradeService);
  isFighting = signal(false);
  private fightIntervalID: number | undefined;

  enemyHP = signal(this.calculateEnemyHP());
  enemyMaxHP = signal(this.calculateEnemyHP());

  isSwiftAttacking = signal(false);
  swiftAttackTimeoutID: number | undefined;
  SWIFT_ATTACK_DURATION = 5000;

  useSwiftAttackSkill() {
    if (this.swiftAttackTimeoutID) {
      clearTimeout(this.swiftAttackTimeoutID);
    }
    this.isSwiftAttacking.set(true);
    this.swiftAttackTimeoutID = setTimeout(() => {
      this.isSwiftAttacking.set(false);
      this.swiftAttackTimeoutID = undefined;
    }, this.SWIFT_ATTACK_DURATION);
  }

  startFighting() {
    this.isFighting.set(true);
    this.performAttack();
    this.fightIntervalID = setTimeout(() => {
      this.startFighting();
    }, this.calculateAttackSpeed());
  }

  stopFighting() {
    this.isFighting.set(false);
    clearTimeout(this.fightIntervalID);
  }
  handleEnemyDefeat() {
    this.characterService.modifyStat('gold', this.calculateGoldReward());
    this.characterService.advanceWave();
    this.enemyHP.set(this.calculateEnemyHP());
    this.enemyMaxHP.set(this.enemyHP());
  }

  performAttack() {
    let attackAmount = this.calculateDamage();
    if (this.criticalHit()) {
      attackAmount *=
        2 + this.goldUpgradeService.getTotalEffect(UpgradeEffectType.CRITICAL_DAMAGE_BOOST);
    }
    const remainingHP = Math.max(0, Math.floor(this.enemyHP() - attackAmount));
    const defeated = remainingHP === 0;
    this.enemyHP.set(remainingHP);
    if (defeated) {
      this.handleEnemyDefeat();
    }
  }

  criticalHit() {
    const criticalChance =
      0.1 + this.goldUpgradeService.getTotalEffect(UpgradeEffectType.CRITICAL_CHANCE_BOOST);
    return Math.random() < criticalChance;
  }

  calculateEnemyHP() {
    const character = this.characterService.character();
    const baseHP = 100;
    const stageMultiplier = 1.5;
    const waveMultiplier = 0.05;

    const stagePower = Math.pow(stageMultiplier, character.currentStage - 1);
    const wavePower = Math.pow(1 + waveMultiplier, character.currentWave - 1);
    let enemyHP = Math.floor(baseHP * stagePower * wavePower);
    const healthReduction = this.prestigeUpgradeService.getTotalEffect(
      UpgradeEffectType.ENEMY_HEALTH_REDUCTION,
    );
    enemyHP = Math.floor(enemyHP * (1 - healthReduction));
    return enemyHP;
  }

  calculateDamage(): number {
    const character = this.characterService.character();
    let damage =
      (character.baseStrength +
        this.goldUpgradeService.getTotalEffect(UpgradeEffectType.FLAT_STAT_BOOST)) *
      character.strengthModifier *
      character.prestigeMultipliers.strength *
      character.prestigeLevel;

    const strengthBoost = this.prestigeUpgradeService.getTotalEffect(
      UpgradeEffectType.FLAT_STAT_BOOST,
    );
    damage *= 1 + strengthBoost;

    const dpsPerCore = this.prestigeUpgradeService.getTotalEffect(
      UpgradeEffectType.DYNAMIC_PER_CORE,
    );
    const unusedCores = character.prestigeCores;
    damage *= 1 + dpsPerCore * unusedCores;
    return Math.floor(damage);
  }

  calculateAttackSpeed(): number {
    const BASE_ATTACK_SPEED = 1000;
    const SWIFT_ATTACK_SKILL_BOOST = 0.5;
    const attackSpeedBoost = this.prestigeUpgradeService.getTotalEffect(
      UpgradeEffectType.ATTACK_SPEED,
    );
    const swiftAttackSkill = this.isSwiftAttacking() ? SWIFT_ATTACK_SKILL_BOOST : 1;
    const finalAttackSpeed = Math.floor(
      BASE_ATTACK_SPEED * (1 - attackSpeedBoost) * swiftAttackSkill,
    );
    return finalAttackSpeed;
  }

  calculateGoldReward(): number {
    const baseGold = 10 * this.characterService.character().currentStage;
    const waveBonusGold = 1 + this.characterService.character().currentWave * 0.05;

    let gold = baseGold * waveBonusGold;

    // #TODO: Add Upgrade for Gold "Critical Chance" increase
    // seperate critical chance from the crit chance used in attacks -- might be upgraded differently later
    const critChance = 0.1;
    if (Math.random() < critChance) {
      gold *= 2;
    }
    return Math.floor(gold);
  }
}
