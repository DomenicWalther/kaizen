import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-skillbutton',
  imports: [],
  templateUrl: './skillbutton.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: ``,
})
export class Skillbutton {
  skillTriggered = output<void>();

  onButtonClick() {
    this.skillTriggered.emit();
  }
}
