import { Component } from '@angular/core';
import { MilestoneCard } from './components/milestone-card/milestone-card';
import { Milestone } from '../../models/milestone.model';

@Component({
  selector: 'app-milestones',
  imports: [MilestoneCard],
  templateUrl: './milestones.html',
  styleUrl: './milestones.css',
})
export class Milestones {
  currentLevel = 1;
  strengthMilestones: Milestone[] = [
    {
      id: 'str-1',
      type: 'Strength',
      requirement: 'Walk 8000 Steps for 7 Days in a Row',
      reward: 5,
      achieved: false,
      level: 1,
    },
    {
      id: 'str-2',
      type: 'Strength',
      requirement: 'Complete 5 Strength Workouts',
      reward: 5,
      achieved: false,
      level: 2,
    },
  ];

  currentMileStone: Milestone = this.strengthMilestones.find(
    (milestone) => milestone.level === this.currentLevel
  )!;

  handleUnlock(milestone: Milestone) {
    this.currentLevel += 1;
    milestone.achieved = true;
    this.currentMileStone = this.strengthMilestones.find(
      (milestone) => milestone.level === this.currentLevel
    )!;
  }
}
