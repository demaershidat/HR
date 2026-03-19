import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { JobService } from '../services/job/job-service';
import { CandidateService } from '../services/candidate/candidate';

@Component({
  selector: 'app-stages',
  standalone: false,
  templateUrl: './stages.html',
  styleUrl: './stages.css',
})
export class Stages implements OnInit {
  jobs: any[] = [];
  uniqueCustomJobs: string[] = [];
  allCandidates: any[] = [];
  filteredCandidates: any[] = [];
  selectedFilter: any = 'all';

  stages = [
    { id: 1, name: 'المرحلة الأولى (المتقدمون)', color: '#111' },
    { id: 2, name: 'المقابلة الشخصية', color: '#555' },
    { id: 3, name: 'الاختبار التقني', color: '#888' },
    { id: 4, name: 'الموافقة النهائية', color: '#2ecc71' }
  ];

  constructor(
    private jobService: JobService,
    private candidateService: CandidateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.jobService.getJobs().subscribe(jobs => {
      this.jobs = jobs;
      this.loadCandidates();
    });
  }

  loadCandidates() {
    this.candidateService.getAllCandidates().subscribe(data => {
      this.allCandidates = data.map((c: any) => ({
        ...c,
        current_stage: Number(c.current_stage) || 1,
        rating: Number(c.rating) || 0,
        job_title: c.display_job || c.job_title || c.custom_job
      }));
      
      this.uniqueCustomJobs = [...new Set(this.allCandidates
        .filter(c => c.custom_job && c.custom_job.trim() !== '')
        .map(c => c.custom_job))];

      this.filterCandidates();
    });
  }

  filterCandidates() {
    if (this.selectedFilter === 'all') {
      this.filteredCandidates = this.allCandidates;
    } else if (isNaN(this.selectedFilter)) {
      this.filteredCandidates = this.allCandidates.filter(c => c.custom_job === this.selectedFilter);
    } else {
      this.filteredCandidates = this.allCandidates.filter(c => c.job_id == this.selectedFilter);
    }
    this.cdr.detectChanges();
  }

  getJobTitle(c: any): string {
    return c.job_title || 'مسمى غير محدد';
  }

  updateStage(candidate: any, newStage: any) {
    const stageId = Number(newStage);
    const payload = { current_stage: stageId };
    
    this.candidateService.updateCandidate(candidate.id, payload).subscribe(() => {
      candidate.current_stage = stageId;
      this.filterCandidates();
    });
  }

  setRating(candidate: any, rating: number) {
    const payload = { rating: rating };
    this.candidateService.updateCandidate(candidate.id, payload).subscribe(() => {
      candidate.rating = rating;
      this.cdr.detectChanges();
    });
  }

  getCandidatesByStage(stageId: number) {
    return this.filteredCandidates.filter(c => Number(c.current_stage) === stageId);
  }

  handleImageError(event: any) {
    event.target.src = 'assets/unknown.png';
  }
}