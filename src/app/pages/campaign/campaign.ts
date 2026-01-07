import { Component, inject, signal } from '@angular/core';
import { CharacterService } from '../../services/character';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-campaign',
  imports: [NgOptimizedImage],
  templateUrl: './campaign.html',
  styleUrl: './campaign.css',
})
export class Campaign {
  characterService = inject(CharacterService);
  get character() {
    return this.characterService.character;
  }

  attackSpeed = signal(1000);
  attackDamage = signal(
    this.character().baseStrength *
      this.character().strengthModifier *
      this.character().prestigeMultipliers.strength
  );
  damagePerSecond = signal(this.attackDamage() / (this.attackSpeed() / 1000));
  enemyHP = signal(100);

  performAttack() {
    let attackAmount = this.attackDamage();
    this.enemyHP.update((hp) => Math.max(0, hp - attackAmount));
    if (this.enemyHP() === 0) {
      this.enemyHP.set(100);
      this.characterService.modifyStat('gold', 50);
      this.character().currentWave += this.character().currentWave < 10 ? 1 : -9;
    }
  }

  beginFight() {
    setInterval(() => {
      this.performAttack();
    }, this.attackSpeed());
  }
}
