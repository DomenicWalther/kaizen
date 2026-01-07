import { Component } from '@angular/core';
import { Milestone } from '../../models/milestone.model';
import { MilestoneCard } from './components/milestone-card/milestone-card';

@Component({
  selector: 'app-milestones',
  imports: [MilestoneCard],
  templateUrl: './milestones.html',
  styleUrl: './milestones.css',
})
export class Milestones {}
