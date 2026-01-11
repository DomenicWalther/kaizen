import { Component, input, output } from '@angular/core';
import { PrestigeUpgrade } from '../../models/prestige.model';

@Component({
  selector: 'app-prestige-upgrade-card',
  imports: [],
  templateUrl: './prestige-upgrade-card.html',
})
export class PrestigeUpgradeCard {
  upgrade = input.required<PrestigeUpgrade>();
  currentCost = input.required<number>();
  totalEffect = input.required<number>();
  purchase = output<void>();
}
