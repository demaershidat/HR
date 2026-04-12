import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { JobService } from '../services/job/job-service';
import { CandidateService } from '../services/candidate/candidate';
import { StageService } from '../services/stage/stage';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { InterviewService } from '../services/interview/interview-servi';

@Component({
  selector: 'app-stages',
  templateUrl: './stages.html',
  styleUrls: ['./stages.css'],
  standalone: false
})
export class Stages implements OnInit, OnDestroy {

  jobs: any[] = [];
  uniqueCustomJobs: string[] = [];
  allCandidates: any[] = [];
  filteredCandidates: any[] = [];
  selectedFilter: any = 'all';
  stages: any[] = [];
  private dataSub?: Subscription;

  showStageForm = false;
  isEditMode = false;
  editingStageId: number | null = null;
  newStageName = '';
  newStageType: 'interview' | 'final' | '' = '';

  constructor(
    private jobService: JobService,
    private candidateService: CandidateService,
    private interviewService: InterviewService,
    private stageService: StageService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.refreshData();
  }

  ngOnDestroy() {
    this.dataSub?.unsubscribe();
  }

  refreshData() {
    this.dataSub = forkJoin({
      stages: this.stageService.getStages(),
      jobs: this.jobService.getJobs(),
      candidates: this.candidateService.getAllCandidates()
    }).pipe(take(1)).subscribe(({ stages, jobs, candidates }) => {

      this.stages = stages.map((s: any) => ({
        ...s,
        color: s.is_interview ? '#7022ba' : s.is_final ? '#2ecc71' : '#64748b'
      }));

      this.jobs = jobs;

      this.allCandidates = candidates
        .filter((c: any) => c.contract_status !== 'تم الانضمام')
        .map((c: any) => {
          const job = this.jobs.find((j: any) => j.id == c.job_id);
          return {
            ...c,
            current_stage: Number(c.current_stage) || 1,
            rating: Number(c.rating) || 0,
            display_job: job ? job.job_title : (c.custom_job || 'مرشح عام')
          };
        });

      this.uniqueCustomJobs = [
        ...new Set(
          this.allCandidates
            .filter((c: any) => c.custom_job)
            .map((c: any) => c.custom_job)
        )
      ];

      this.filterCandidates();
    });
  }

  filterCandidates() {
    let results: any[] = [];

    if (this.selectedFilter === 'all') {
      results = [...this.allCandidates];
    } 
    else if (isNaN(this.selectedFilter)) {
      results = this.allCandidates.filter((c: any) => c.custom_job === this.selectedFilter);
    } 
    else {
      results = this.allCandidates.filter((c: any) => Number(c.job_id) === Number(this.selectedFilter));
    }

    this.filteredCandidates = results;
    this.cdr.detectChanges();
  }

  updateStage(candidate: any, newStageId: any) {
    const targetId = Number(newStageId);
    const oldStageId = candidate.current_stage;

    const oldStage = this.stages.find(s => s.id === oldStageId);
    const newStage = this.stages.find(s => s.id === targetId);

    const currentIdx = this.stages.findIndex((s: any) => s.id === oldStageId);
    const newIdx = this.stages.findIndex((s: any) => s.id === targetId);

    if (newIdx > currentIdx && candidate.rating === 0 && oldStageId !== 1) {
      alert('يجب تقييم المرحلة الحالية قبل الانتقال للمرحلة التالية!');
      candidate.current_stage = oldStageId;
      this.cdr.detectChanges();
      return;
    }

    const updatePayload = { current_stage: targetId, rating: 0 };

    this.candidateService.updateCandidate(candidate.id, updatePayload).pipe(take(1)).subscribe({
      next: () => {
        if (oldStage?.is_interview && !newStage?.is_interview) {
          this.removeInterviewsForCandidate(candidate.id);
        }

        candidate.current_stage = targetId;
        candidate.rating = 0;
        this.filterCandidates();
        this.cdr.detectChanges();

        if (newStage) {
          if (Number(newStage.is_interview) === 1) {
            const interviewData = {
              candidate_id: candidate.id,
              interview_date: new Date().toISOString().split('T')[0],
              interview_time: '10:00',
              is_finished: 0
            };

            this.interviewService.createInterview(interviewData).pipe(take(1)).subscribe({
              next: () => this.router.navigate(['/recruitment/interviews']),
              error: (err: any) => console.error('فشل إنشاء سجل المقابلة', err)
            });
          } 
          else if (Number(newStage.is_final) === 1) {
            this.router.navigate(['/recruitment/onboarding']);
          }
        }
      },
      error: () => {
        candidate.current_stage = oldStageId;
        this.cdr.detectChanges();
      }
    });
  }

  private removeInterviewsForCandidate(candidateId: number) {
    this.interviewService.getAllInterviews().pipe(take(1)).subscribe({
      next: (interviews: any[]) => {
        const candidateInterviews = interviews.filter(inv => inv.candidate_id == candidateId);
        candidateInterviews.forEach(inv => {
          const id = inv.interview_id || inv.id;
          this.interviewService.deleteInterview(id).subscribe({
            error: (err) => console.error('خطأ في حذف المقابلة التلقائي', err)
          });
        });
      }
    });
  }

  saveStage() {
    if (!this.newStageName.trim()) return;

    const payload = {
      name: this.newStageName.trim(),
      is_interview: this.newStageType === 'interview' ? 1 : 0,
      is_final: this.newStageType === 'final' ? 1 : 0
    };

    const request =
      this.isEditMode && this.editingStageId
        ? this.stageService.updateStage(this.editingStageId, payload)
        : this.stageService.addStage(payload);

    request.pipe(take(1)).subscribe(() => {
      this.refreshData();
      this.closeStageForm();
    });
  }

  deleteStage(stage: any) {
    if (stage.id === 1) {
      alert('لا يمكن حذف المرحلة الأساسية');
      return;
    }

    if (this.allCandidates.some((c: any) => Number(c.current_stage) === stage.id)) {
      alert('المرحلة تحتوي على مرشحين حاليين، لا يمكن حذفها');
      return;
    }

    if (confirm(`هل أنت متأكد من حذف مرحلة "${stage.name}"؟`)) {
      this.stageService.deleteStage(stage.id).pipe(take(1)).subscribe(() => this.refreshData());
    }
  }

  setRating(candidate: any, rating: number) {
    if (Number(candidate.current_stage) === 1) return;

    this.candidateService.updateCandidate(candidate.id, { rating }).pipe(take(1)).subscribe(() => {
      candidate.rating = rating;
      this.cdr.detectChanges();
    });
  }

  openStageForm(stage: any = null) {
    if (stage) {
      this.isEditMode = true;
      this.editingStageId = stage.id;
      this.newStageName = stage.name;
      this.newStageType = stage.is_interview ? 'interview' : (stage.is_final ? 'final' : '');
    } 
    else {
      this.isEditMode = false;
      this.editingStageId = null;
      this.newStageName = '';
      this.newStageType = '';
    }
    this.showStageForm = true;
  }

  closeStageForm() {
    this.showStageForm = false;
  }

  selectStageType(type: 'interview' | 'final') {
    this.newStageType = this.newStageType === type ? '' : type;
  }

  getCandidatesByStage(stageId: number) {
    return this.filteredCandidates.filter((c: any) => Number(c.current_stage) === Number(stageId));
  }

  handleImageError(event: any) {
    event.target.src = 'assets/unknown.png';
  }

  trackByCandidateId(index: number, item: any) {
    return item.id;
  }

  trackByStageId(index: number, item: any) {
    return item.id;
  }
}