import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-skillbutton',
  imports: [],
  templateUrl: './skillbutton.html',
  styles: ``,
})
export class Skillbutton {
  skillTriggered = output<void>();

  onButtonClick() {
    this.skillTriggered.emit();
  }
}
