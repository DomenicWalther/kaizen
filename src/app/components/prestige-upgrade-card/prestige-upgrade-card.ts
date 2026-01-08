import { Component, input } from '@angular/core';

@Component({
  selector: 'app-prestige-upgrade-card',
  imports: [],
  templateUrl: './prestige-upgrade-card.html',
})
export class PrestigeUpgradeCard {
  upgradeEffect = input.required<string>();
  upgradeCost = input.required<number>();
  upgradeCurrentEffect = input.required<string>();
}
