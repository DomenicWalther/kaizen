import { Component, input, output } from '@angular/core';
import { Milestone } from '../../../../models/milestone.model';

@Component({
  selector: 'app-milestone-card',
  imports: [],
  templateUrl: './milestone-card.html',
  styleUrl: './milestone-card.css',
})
export class MilestoneCard {
  milestone = input.required<Milestone>();

  unlockMilestone = output<Milestone>();

  onUnlockClick() {
    this.unlockMilestone.emit(this.milestone());
  }
}
