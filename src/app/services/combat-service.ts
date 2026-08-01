import { computed, effect, inject, Injectable, signal } from '@angular/core';
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
  private readonly BASE_ATTACK_SPEED = 1000;
  private readonly MIN_ATTACK_SPEED = 100;
  private readonly SWIFT_ATTACK_SKILL_BOOST = 0.5;

  enemyHP = signal(0);
  enemyMaxHP = computed(() => {
    const character = this.characterService.character();
    const baseHP = 100;
    const stageMultiplier = 1.5;
    const waveMultiplier = 0.05;

    const stagePower = Math.pow(stageMultiplier, character.currentStage - 1);
    const wavePower = Math.pow(1 + waveMultiplier, character.currentWave - 1);
    let maxHP = Math.floor(baseHP * stagePower * wavePower);
    const healthReduction = this.clamp(
      this.prestigeUpgradeService.getTotalEffect(UpgradeEffectType.ENEMY_HEALTH_REDUCTION),
      0,
      0.95,
    );
    maxHP = Math.floor(maxHP * (1 - healthReduction));
    return maxHP;
  });

  constructor() {
    effect(() => {
      if (!this.characterService.hasLoadedFromDb()) return;

      const maxHP = this.enemyMaxHP();
      this.enemyHP.update((currentHP) => {
        if (currentHP <= 0) return maxHP;
        return Math.min(currentHP, maxHP);
      });
    });
  }

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
    if (this.isFighting()) return;

    this.isFighting.set(true);
    this.performAttack();
    this.scheduleNextAttack();
  }

  private scheduleNextAttack() {
    if (!this.isFighting()) return;

    this.fightIntervalID = setTimeout(() => {
      this.performAttack();
      this.scheduleNextAttack();
    }, this.calculateAttackSpeed());
  }

  stopFighting() {
    if (!this.isFighting()) return;

    this.isFighting.set(false);
    if (this.fightIntervalID !== undefined) {
      clearTimeout(this.fightIntervalID);
      this.fightIntervalID = undefined;
    }
  }
  handleEnemyDefeat() {
    this.characterService.modifyStat('gold', this.calculateGoldReward());
    this.characterService.advanceWave();
    this.enemyHP.set(this.enemyMaxHP());
  }

  performAttack() {
    if (!this.isFighting()) return;

    let attackAmount = this.calculateDamage();
    if (this.criticalHit()) {
      attackAmount *=
        2 + this.goldUpgradeService.getTotalEffect(UpgradeEffectType.CRITICAL_DAMAGE_BOOST);
    }
    const currentHP = this.enemyHP();
    const remainingHP = Math.max(0, Math.floor(currentHP - attackAmount));
    const defeated = remainingHP === 0;
    this.enemyHP.set(remainingHP);
    if (defeated) {
      this.handleEnemyDefeat();
      this.applyOverkillDamage(attackAmount - currentHP);
    }
  }

  private applyOverkillDamage(remainingDamage: number): void {
    const overkillWaves = Math.max(
      0,
      Math.floor(this.prestigeUpgradeService.getTotalEffect(UpgradeEffectType.OVERKILL_WAVE)),
    );
    if (overkillWaves === 0 || remainingDamage <= 0) return;

    let wavesCleared = 0;
    while (wavesCleared < overkillWaves) {
      const nextTargetHP = this.enemyMaxHP();
      if (remainingDamage < nextTargetHP) {
        this.enemyHP.set(Math.floor(nextTargetHP - remainingDamage));
        return;
      }

      remainingDamage -= nextTargetHP;
      this.handleEnemyDefeat();
      wavesCleared++;
    }

    const nextTargetHP = this.enemyMaxHP();
    this.enemyHP.set(Math.max(1, Math.floor(nextTargetHP - remainingDamage)));
  }

  criticalHit() {
    const criticalChance = this.clamp(
      0.1 + this.goldUpgradeService.getTotalEffect(UpgradeEffectType.CRITICAL_CHANCE_BOOST),
      0,
      1,
    );
    return Math.random() < criticalChance;
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
    const rawAttackSpeedBoost = this.prestigeUpgradeService.getTotalEffect(
      UpgradeEffectType.ATTACK_SPEED,
    );
    const attackSpeedBoost = this.clamp(rawAttackSpeedBoost, 0, 0.9);
    const swiftAttackSkill = this.isSwiftAttacking() ? this.SWIFT_ATTACK_SKILL_BOOST : 1;
    const finalAttackSpeed = Math.max(
      this.MIN_ATTACK_SPEED,
      Math.floor(this.BASE_ATTACK_SPEED * (1 - attackSpeedBoost) * swiftAttackSkill),
    );
    return finalAttackSpeed;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
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
