import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Milestones {
  milestones = signal<Milestones[]>(this.loadMilestones());

  constructor() {
    effect(() => {
      localStorage.setItem('milestones', JSON.stringify(this.milestones()));
    });
  }

  private loadMilestones(): Milestones[] {
    const saved = localStorage.getItem('milestones');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  }
}
