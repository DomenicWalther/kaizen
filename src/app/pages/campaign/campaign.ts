import { Component, computed, inject, signal } from '@angular/core';
import { CharacterService } from '../../services/character';
import { NgOptimizedImage } from '@angular/common';
import { Character } from '../../models/character.model';

@Component({
  selector: 'app-campaign',
  imports: [NgOptimizedImage],
  templateUrl: './campaign.html',
})
export class Campaign {
  characterService = inject(CharacterService);
  isFighting = signal(false);
  fightIntervalID: any;
  get character() {
    return this.characterService.character;
  }

  attackSpeed = signal(1000);
  attackDamage = computed(() => {
    const char = this.character();
    const baseDamage =
      char.baseStrength * char.strengthModifier * char.prestigeMultipliers.strength;
    return baseDamage;
  });
  damagePerSecond = computed(() => this.attackDamage() * (1000 / this.attackSpeed()));
  enemyHP = signal(this.calculateEnemyHP());

  performAttack() {
    let attackAmount = this.attackDamage();
    this.enemyHP.update((hp) => Math.max(0, hp - attackAmount));
    if (this.enemyHP() === 0) {
      this.handleEnemyDefeat();
    }
  }

  handleEnemyDefeat() {
    this.enemyHP.set(this.calculateEnemyHP());
    this.characterService.modifyStat('gold', 50);
    if (this.character().currentWave == 10) {
      this.character().currentStage += 1;
    }
    this.character().currentWave += this.character().currentWave < 10 ? 1 : -9;
  }

  calculateEnemyHP() {
    const baseHP = 100;
    const stageMultiplier = 1.6;
    const waveMultiplier = 0.05;

    const stagePower = Math.pow(stageMultiplier, this.character().currentStage - 1);
    const wavePower = Math.pow(1 + waveMultiplier, this.character().currentWave - 1);
    return Math.floor(baseHP * stagePower * wavePower);
  }

  increaseAttackSpeed() {
    this.attackSpeed.update((speed) => speed / 2);
  }

  toggleFight() {
    if (this.isFighting()) {
      clearInterval(this.fightIntervalID);
      this.isFighting.set(false);
    } else {
      this.fightIntervalID = setInterval(() => {
        this.performAttack();
      }, this.attackSpeed());
      this.isFighting.set(true);
    }
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
}
