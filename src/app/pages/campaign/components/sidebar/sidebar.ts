import { Component, input } from '@angular/core';
import { BigDecimalFormat } from '../../../../shared/pipes/BigDecimalFormatthing.pipe';

import { Character } from '../../../../models/character.model';
@Component({
  selector: 'app-sidebar',
  imports: [BigDecimalFormat],
  templateUrl: './sidebar.html',
  styles: ``,
})
export class Sidebar {
  character = input.required<Character>();
  attackDamage = input.required<number>();
  attackSpeed = input.required<number>();
}
