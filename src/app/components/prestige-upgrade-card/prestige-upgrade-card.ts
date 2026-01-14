import { Component, computed, input, output } from '@angular/core';
import { Upgrade } from '../../models/prestige.model';

@Component({
  selector: 'app-prestige-upgrade-card',
  imports: [],
  templateUrl: './prestige-upgrade-card.html',
})
export class PrestigeUpgradeCard {
  upgrade = input.required<Upgrade>();
  currentCost = input.required<number>();
  totalEffect = input.required<number>();
  flooredTotalEffect = computed(() => Math.floor(this.totalEffect() * 100) / 100);
  label = input.required<string>();
  purchase = output<void>();
}
