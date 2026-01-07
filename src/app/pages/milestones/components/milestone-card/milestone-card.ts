import { Component } from '@angular/core';
import { Milestone } from '../../../../models/milestone.model';

@Component({
  selector: 'app-milestone-card',
  imports: [],
  templateUrl: './milestone-card.html',
  styleUrl: './milestone-card.css',
})
export class MilestoneCard {
  strengthMilestones: Milestone[] = [
    {
      id: 'str-1',
      type: 'Strength',
      requirement: 'Walk 8000 Steps for 7 Days in a Row',
      reward: 5,
      achieved: false,
      level: 1,
    },
  ];
}
