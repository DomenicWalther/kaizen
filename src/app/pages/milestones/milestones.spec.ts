import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Milestones } from './milestones';

describe('Milestones', () => {
  let component: Milestones;
  let fixture: ComponentFixture<Milestones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Milestones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Milestones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
