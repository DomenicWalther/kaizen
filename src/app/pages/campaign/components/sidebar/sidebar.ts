import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { BigDecimalFormat } from '../../../../shared/pipes/BigDecimalFormatthing.pipe';

import { Character } from '../../../../models/character.model';
import { Label } from './label/label';
@Component({
  selector: 'app-sidebar',
  imports: [BigDecimalFormat, Label],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: ``,
})
export class Sidebar {
  character = input.required<Character>();
  attackDamage = input.required<number>();
  attackSpeed = input.required<number>();
  strengthMultiplier = input.required<number>();
}
