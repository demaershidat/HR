import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEmp } from './dashboard-emp';

describe('DashboardEmp', () => {
  let component: DashboardEmp;
  let fixture: ComponentFixture<DashboardEmp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardEmp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardEmp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
