import { Component, input } from '@angular/core';

@Component({
  selector: 'app-label',
  imports: [],
  templateUrl: './label.html',
  styles: ``,
})
export class Label {
  MAIN_LABEL = input.required<string>();
  SECONDARY_LABEL = input.required<string>();
}
