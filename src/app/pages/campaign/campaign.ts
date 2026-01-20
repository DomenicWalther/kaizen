import { Component, computed, inject, signal } from '@angular/core';
import { CharacterService } from '../../services/character-service';
import { NgOptimizedImage, NgStyle } from '@angular/common';
import { Character } from '../../models/character.model';
import { CombatService } from '../../services/combat-service';
import { PrestigeService } from '../../services/prestige-service';
import { BigDecimalFormat } from '../../shared/pipes/BigDecimalFormatthing.pipe';
import { Sidebar } from './components/sidebar/sidebar';
import { HPBar } from './components/hp-bar/hp-bar';

@Component({
  selector: 'app-campaign',
  imports: [NgOptimizedImage, NgStyle, BigDecimalFormat, Sidebar, HPBar],
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
    () =>
      Math.floor(this.attackDamage() * (1000 / this.combatService.calculateAttackSpeed()) * 100) /
      100,
  );

  attackSpeed = computed(
    () => Math.floor((1000 / this.combatService.calculateAttackSpeed()) * 100) / 100,
  );

  prestige() {
    const coresEarned = this.prestigeService.calculatePrestigeCores();
    if (coresEarned > 0) {
      this.prestigeService.prestige();
    }
  }

  toggleFight() {
    if (this.isFighting()) {
      this.isFighting.set(false);
      this.combatService.stopFighting();
    } else {
      this.isFighting.set(true);
      this.combatService.startFighting();
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
    amount: number,
  ) {
    this.characterService.modifyStat(stat, amount);
  }
}
