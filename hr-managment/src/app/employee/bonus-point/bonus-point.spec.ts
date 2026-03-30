import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonusPoint } from './bonus-point';

describe('BonusPoint', () => {
  let component: BonusPoint;
  let fixture: ComponentFixture<BonusPoint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BonusPoint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonusPoint);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
