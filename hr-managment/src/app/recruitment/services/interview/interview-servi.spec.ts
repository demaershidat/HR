import { TestBed } from '@angular/core/testing';

import { InterviewServi } from './interview-servi';

describe('InterviewServi', () => {
  let service: InterviewServi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterviewServi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
