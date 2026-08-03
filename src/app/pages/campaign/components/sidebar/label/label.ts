import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-label',
  imports: [],
  templateUrl: './label.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: ``,
})
export class Label {
  MAIN_LABEL = input.required<string>();
  SECONDARY_LABEL = input.required<string>();
}
