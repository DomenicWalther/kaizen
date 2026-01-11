import { Component, computed, inject, signal } from '@angular/core';
import { CharacterService } from '../../services/character-service';
import { NgOptimizedImage } from '@angular/common';
import { Character } from '../../models/character.model';
import { CombatService } from '../../services/combat-service';
import { PrestigeService } from '../../services/prestige-service';

@Component({
  selector: 'app-campaign',
  imports: [NgOptimizedImage],
  templateUrl: './campaign.html',
})
export class Campaign {
  characterService = inject(CharacterService);
  combatService = inject(CombatService);
  prestigeService = inject(PrestigeService);
  isFighting = signal(false);
  fightIntervalID: any;
  get character() {
    return this.characterService.character;
  }

  attackSpeed = computed(() => this.combatService.calculateAttackSpeed());
  enemyHP = signal(this.combatService.calculateEnemyHP());

  // Computed signals
  attackDamage = computed(() => this.combatService.calculateDamage());
  damagePerSecond = computed(() => this.attackDamage() * (1000 / this.attackSpeed()));

  handleEnemyDefeat() {
    this.characterService.modifyStat('gold', 50);
    this.characterService.advanceWave();
    this.enemyHP.set(this.combatService.calculateEnemyHP());
  }

  performAttack() {
    const result = this.combatService.performAttack(this.enemyHP());
    this.enemyHP.set(result.remainingHP);
    if (result.defeated) {
      this.handleEnemyDefeat();
    }
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

  prestige() {
    const coresEarned = this.prestigeService.calculatePrestigeCores();
    if (coresEarned > 0) {
      this.prestigeService.prestige();
    }
  }

  skipStage20() {
    this.character().currentStage = 21;
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
