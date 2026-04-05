import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { CandidateService } from '../services/candidate/candidate';

@Injectable({ providedIn: 'root' })
export class CandidatesResolver implements Resolve<any[]> {
  constructor(private candidateService: CandidateService) {}

  resolve(): Observable<any[]> {
    return this.candidateService.getAllCandidates();
  }
}