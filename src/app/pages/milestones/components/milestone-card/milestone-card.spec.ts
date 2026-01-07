import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestoneCard } from './milestone-card';

describe('MilestoneCard', () => {
  let component: MilestoneCard;
  let fixture: ComponentFixture<MilestoneCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MilestoneCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MilestoneCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
