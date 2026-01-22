import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styles: ``,
})
export class Modal {
  isOpen = model<boolean>(false);

  toggleModal() {
    this.isOpen.update((v) => !v);
  }
}
