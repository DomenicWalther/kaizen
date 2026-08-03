import { Component, input, model, output } from '@angular/core';
import { BigDecimalFormat } from '../../../../shared/pipes/BigDecimalFormatthing.pipe';

@Component({
  selector: 'app-modal',
  imports: [BigDecimalFormat],
  templateUrl: './modal.html',
  styleUrl: './styles.css',
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
