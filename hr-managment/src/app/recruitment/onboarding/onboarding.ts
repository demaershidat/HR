import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CandidateService } from '../services/candidate/candidate';
import { JobService } from '../services/job/job-service';
import { StageService } from '../services/stage/stage';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-onboarding',
  standalone: false,
  templateUrl: './onboarding.html',
  styleUrls: ['./onboarding.css']
})
export class Onboarding implements OnInit {
  hiredCandidates: any[] = [];
  jobs: any[] = [];
  allStages: any[] = [];

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
    private stageService: StageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    forkJoin({
      stages: this.stageService.getStages(),
      jobs: this.jobService.getJobs()
    }).subscribe({
      next: (result) => {
        this.allStages = result.stages;
        this.jobs = result.jobs;
        this.loadHiredCandidates();
      }
    });
  }

  loadHiredCandidates() {
    this.candidateService.getAllCandidates().subscribe(data => {
      const finalStageIds = this.allStages
        .filter(s => s.is_final === 1 || s.is_final === true)
        .map(s => Number(s.id));

      this.hiredCandidates = data
        .filter(c => finalStageIds.includes(Number(c.current_stage)))
        .map(c => ({
          ...c,
          display_job: this.getJobTitle(c)
        }));
      this.cdr.detectChanges();
    });
  }

  getJobTitle(c: any) {
    const job = this.jobs.find(j => j.id == c.job_id);
    return job ? job.job_title : c.custom_job || 'غير محدد';
  }

  onStatusChange(candidate: any, newStatus: string) {
    this.candidateService.updateCandidate(candidate.id, { contract_status: newStatus }).subscribe({
      next: () => {
        candidate.contract_status = newStatus;
        if (newStatus === 'تم الانضمام') {
          this.hiredCandidates = this.hiredCandidates.filter(c => c.id !== candidate.id);
        }
        this.cdr.detectChanges();
      }
    });
  }

  handleImageError(event: any) {
    event.target.src = 'assets/unknown.png';
  }
}