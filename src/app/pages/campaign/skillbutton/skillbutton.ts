import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-skillbutton',
  imports: [],
  templateUrl: './skillbutton.html',
  styles: ``,
})
export class Skillbutton {
  skillTriggered = output<void>();
  label = input.required<String>();

  onButtonClick() {
    this.skillTriggered.emit();
  }
}
