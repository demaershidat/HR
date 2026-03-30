import { Component, OnInit } from '@angular/core';
import { CandidateService } from '../../recruitment/services/candidate/candidate';
import { JobService } from '../../recruitment/services/job/job-service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-employee',
  standalone: false,
  templateUrl: './employee.html',
  styleUrl: './employee.css',
})
export class Employee implements OnInit {
  employees: any[] = [];
  jobs: any[] = [];
  loading = true;

  constructor(
    private candidateService: CandidateService,
    private jobService: JobService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      candidates: this.candidateService.getAllCandidates(),
      jobs: this.jobService.getJobs()
    }).subscribe({
      next: (res) => {
        this.jobs = res.jobs;
        this.employees = res.candidates
          .filter(c => c.contract_status === 'تم الانضمام')
          .map(emp => ({
            ...emp,
            display_job: this.getJobTitle(emp)
          }));
        this.loading = false;
      }
    });
  }

  getJobTitle(emp: any) {
    const job = this.jobs.find(j => j.id == emp.job_id);
    return job ? job.job_title : emp.custom_job || 'موظف';
  }
}