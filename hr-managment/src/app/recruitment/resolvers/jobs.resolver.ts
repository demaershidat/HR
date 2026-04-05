import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { JobService } from '../services/job/job-service';

@Injectable({ providedIn: 'root' })
export class JobResolver implements Resolve<any[]> {
  constructor(private jobService: JobService) {}

  resolve(): Observable<any[]> {
    return this.jobService.getJobs();
  }
}