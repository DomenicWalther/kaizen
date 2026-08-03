import { Component, computed, inject } from '@angular/core';
import { CharacterService } from '../../services/character-service';
import { NgStyle } from '@angular/common';
import { Character } from '../../models/character.model';
import { CombatService } from '../../services/combat-service';
import { PrestigeService } from '../../services/prestige-service';
import { PrestigeUpgradeService } from '../../services/prestige-upgrade-service';
import { BigDecimalFormat } from '../../shared/pipes/BigDecimalFormatthing.pipe';
import { Sidebar } from './components/sidebar/sidebar';
import { HPBar } from './components/hp-bar/hp-bar';
import { Skillbutton } from './components/skillbutton/skillbutton';
import { Modal } from './components/modal/modal';
import { MacroPanel } from './components/macro-panel/macro-panel';
import { UpgradeEffectType } from '../../models/prestige.model';

@Component({
  selector: 'app-campaign',
  imports: [NgStyle, BigDecimalFormat, Sidebar, HPBar, Skillbutton, Modal, MacroPanel],
  host: {
    class: 'block h-full min-h-0',
  },
  templateUrl: './campaign.html',
})
export class Campaign {
  characterService = inject(CharacterService);
  combatService = inject(CombatService);
  prestigeService = inject(PrestigeService);
  prestigeUpgradeService = inject(PrestigeUpgradeService);
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

  strengthMultiplier = computed(
    () =>
      this.character().prestigeMultipliers.strength +
      this.prestigeUpgradeService.getTotalEffect(UpgradeEffectType.STRENGTH_MULTIPLIER),
  );

  prestige() {
    const coresEarned = this.prestigeService.calculatePrestigeCores();
    if (coresEarned > 0) {
      this.prestigeService.prestige();
    }
  }

  toggleFight() {
    if (this.combatService.isFighting()) {
      this.combatService.stopFighting();
    } else {
      this.combatService.startFighting();
    }
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
