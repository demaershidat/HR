import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRec } from './dashboard-rec';

describe('DashboardRec', () => {
  let component: DashboardRec;
  let fixture: ComponentFixture<DashboardRec>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardRec]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardRec);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
