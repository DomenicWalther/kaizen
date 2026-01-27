import { Component, input, output } from '@angular/core';
import { Upgrade } from '../../../../models/prestige.model';
import { BigDecimalFormat } from '../../../../shared/pipes/BigDecimalFormatthing.pipe';

@Component({
  selector: 'app-upgrade-card',
  imports: [BigDecimalFormat],
  templateUrl: './upgrade-card.html',
  styles: ``,
})
export class UpgradeCard {
  upgrade = input.required<Upgrade>();
  label = input.required<String>();
  currentCost = input.required<number>();
  totalEffect = input.required<number>();
  purchase = output<void>();
}
