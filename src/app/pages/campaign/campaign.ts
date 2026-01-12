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

  // Computed signals
  attackDamage = computed(() => this.combatService.calculateDamage());
  damagePerSecond = computed(
    () => this.attackDamage() * (1000 / this.combatService.calculateAttackSpeed())
  );

  toggleFight() {
    this.combatService.startFighting();
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

  useSwiftAttackSkill() {
    this.combatService.useSwiftAttackSkill();
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
