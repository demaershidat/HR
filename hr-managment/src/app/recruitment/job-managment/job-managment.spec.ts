import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobManagment } from './job-managment';

describe('JobManagment', () => {
  let component: JobManagment;
  let fixture: ComponentFixture<JobManagment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JobManagment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobManagment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
