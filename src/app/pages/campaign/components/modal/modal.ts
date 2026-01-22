import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styles: ``,
})
export class Modal {
  isOpen = model<boolean>(false);
  triggerCallback = output<void>();
  coreLabel = input.required<number>();

  onButtonClick() {
    this.toggleModal();
    this.triggerCallback.emit();
  }

  toggleModal() {
    this.isOpen.update((v) => !v);
  }
}
