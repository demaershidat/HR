import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CandidateService } from '../services/candidate/candidate';
import { JobService } from '../services/job/job-service';

@Component({
  selector: 'app-onboarding',
  standalone: false,
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding implements OnInit {
  hiredCandidates: any[] = [];
  jobs: any[] = [];
  
  contractStatuses = [
    { value: 'لم يرسل', label: 'لم يرسل' },
    { value: 'تم الإرسال', label: 'تم الإرسال' },
    { value: 'مقبول', label: 'مقبول' },
    { value: 'مرفوض', label: 'مرفوض' },
    { value: 'تم الانضمام', label: 'تم الانضمام' }
  ];

  constructor(
    private candidateService: CandidateService,
    private jobService: JobService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.jobService.getJobs().subscribe(jobs => {
      this.jobs = jobs;
      this.loadHiredCandidates();
    });
  }

  loadHiredCandidates() {
    this.candidateService.getAllCandidates().subscribe(data => {
      this.hiredCandidates = data
        .filter((c: any) => c.current_stage == 4)
        .map((c: any) => ({
          ...c,
          contract_status: c.contract_status || 'لم يرسل',
          display_job: this.getJobTitle(c) 
        }));
      this.cdr.detectChanges();
    });
  }

  getJobTitle(c: any): string {
    if (c.custom_job) return c.custom_job;
    const job = this.jobs.find(j => j.id == c.job_id);
    return job ? job.job_title : (c.job_title || '---');
  }

  onStatusChange(candidate: any, newStatus: string) {
    const date = new Date();
    const formattedDate = date.getFullYear() + '-' + 
      ('0' + (date.getMonth() + 1)).slice(-2) + '-' + 
      ('0' + date.getDate()).slice(-2) + ' ' + 
      ('0' + date.getHours()).slice(-2) + ':' + 
      ('0' + date.getMinutes()).slice(-2) + ':' + 
      ('0' + date.getSeconds()).slice(-2);
    
    const updateData = {
      contract_status: newStatus,
      contract_sent_date: formattedDate
    };

    this.candidateService.updateCandidate(candidate.id, updateData).subscribe({
      next: () => {
        candidate.contract_status = newStatus;
        candidate.contract_sent_date = formattedDate;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Update failed:', err);
      }
    });
  }

  handleImageError(event: any) {
    event.target.src = 'assets/unknown.png';
  }
}