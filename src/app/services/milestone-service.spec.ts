import { TestBed } from '@angular/core/testing';
import { MilestoneService } from './milestone-service';

describe('MilestoneService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [MilestoneService] });
  });

  it('recovers gracefully from invalid persisted JSON', () => {
    localStorage.setItem('milestones', '{not-json');

    const service = TestBed.inject(MilestoneService);

    expect(service.milestones()).toEqual([]);
    expect(localStorage.getItem('milestones')).toBe('[]');
  });
});
