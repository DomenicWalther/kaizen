import { effect, Injectable, signal } from '@angular/core';
import { Milestone } from '../models/milestone.model';

@Injectable({
  providedIn: 'root',
})
export class MilestoneService {
  milestones = signal<Milestone[]>(this.loadMilestones());

  constructor() {
    effect(() => {
      localStorage.setItem('milestones', JSON.stringify(this.milestones()));
    });
  }

  private loadMilestones(): Milestone[] {
    const saved = localStorage.getItem('milestones');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  }
}
