import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CandidateService } from '../services/candidate/candidate';
import { JobService } from '../services/job/job-service';
import { StageService } from '../services/stage/stage';
import { InterviewService } from '../services/interview/interview-servi';

@Component({
  selector: 'app-interviews',
  templateUrl: './interviews.html',
  styleUrls: ['./interviews.css'],
  standalone: false
})
export class Interviews implements OnInit {

  interviewees: any[] = [];
  allInterviewees: any[] = [];
  allCandidates: any[] = [];
  jobs: any[] = [];
  allStages: any[] = [];
  loading = true;

  isModalOpen = false;
  isEditMode = false;
  errorMessage = '';

  formData: any = {
    id: null,
    candidate_id: '',
    interview_date: '',
    interview_time: '',
    interview_description: '',
    is_finished: false
  };

  constructor(
    private candidateService: CandidateService,
    private interviewService: InterviewService,
    private jobService: JobService,
    private stageService: StageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {

    this.jobService.getJobs().subscribe({
      next: (jobs: any[]) => {

        this.jobs = jobs;

        this.stageService.getStages().subscribe({
          next: (stages: any[]) => {
            this.allStages = stages;
            this.loadData();
          },
          error: () => this.loadData()
        });

      },
      error: () => this.loadData()
    });

  }

  loadData() {

    this.candidateService.getAllCandidates().subscribe({
      next: (candidates: any[]) => {

       this.allCandidates = candidates.filter(
  (c: any) => c.contract_status !== 'تم الانضمام'
);

        this.interviewService.getAllInterviews().subscribe({

          next: (data: any[]) => {

            const interviewStageIds = this.allStages
              .filter((s: any) => s.is_interview === 1 || s.is_interview === true)
              .map((s: any) => Number(s.id));

            this.allInterviewees = data
              .map((inv: any) => {

                const c = this.allCandidates.find((x: any) => x.id == inv.candidate_id);
                const isInInterviewStage =
                  c && interviewStageIds.includes(Number(c.current_stage));

                if (!isInInterviewStage) return null;

                const isSystemGenerated =
                  !inv.interview_description ||
                  inv.interview_description.trim() === '';

                return {
                  ...inv,
                  full_name: c?.full_name || '---',
                  profile_image_url: c?.profile_image_url,
                  display_job: this.getJobTitle(c),
                  canDelete: !isSystemGenerated
                };

              })
              .filter((item: any) => item !== null);

            this.interviewees = [...this.allInterviewees];
            this.loading = false;

            this.cdr.detectChanges();

          }

        });

      }

    });

  }

  saveSchedule() {

    if (!this.formData.candidate_id || !this.formData.interview_date || !this.formData.interview_time) {
      this.errorMessage = 'يرجى إكمال البيانات المطلوبة';
      return;
    }

    const payload = {
      candidate_id: Number(this.formData.candidate_id),
      interview_date: this.formData.interview_date,
      interview_time: this.formData.interview_time,
      interview_description: this.formData.interview_description || 'مقابلة إضافية',
      is_finished: this.formData.is_finished ? 1 : 0
    };

    const request =
      (this.isEditMode && this.formData.id)
        ? this.interviewService.updateInterview(this.formData.id, payload)
        : this.interviewService.createInterview(payload);

    request.subscribe({

      next: () => {
        this.closeModal();
        this.loadData();
      },

      error: (err: any) => {
        this.errorMessage = err?.error?.error || 'فشل حفظ البيانات';
      }

    });

  }

  deleteInterview(item: any) {

    if (!item.canDelete) {
      alert('⚠️ لا يمكن حذف المقابلة الأساسية المرتبطة بصفحة المراحل.');
      return;
    }

    const id = item.interview_id || item.id;

    if (confirm('هل أنت متأكد من حذف هذه المقابلة؟')) {

      this.interviewService.deleteInterview(id).subscribe({

        next: () => this.loadData(),

        error: (err: any) => {
          alert(err?.error?.message || 'فشل الحذف');
        }

      });

    }

  }

  getJobTitle(c: any): string {

    if (!c) return '---';

    if (c.custom_job) return c.custom_job;

    const job = this.jobs.find((j: any) => j.id == c.job_id);

    return job ? job.job_title : 'خارجي';

  }

  onSearch(event: any) {

    const term = event.target.value.toLowerCase();

    this.interviewees = term
      ? this.allInterviewees.filter((x: any) =>
          x.full_name?.toLowerCase().includes(term) ||
          x.display_job?.toLowerCase().includes(term)
        )
      : [...this.allInterviewees];

  }

  openScheduleModal(data: any = null) {

    this.errorMessage = '';

    if (data) {

      this.isEditMode = true;

      this.formData = {
        id: data.interview_id || data.id,
        candidate_id: data.candidate_id,
        interview_date: data.interview_date?.split('T')[0],
        interview_time: data.interview_time,
        interview_description: data.interview_description || '',
        is_finished: data.is_finished == 1
      };

    } else {

      this.isEditMode = false;

      this.formData = {
        id: null,
        candidate_id: '',
        interview_date: '',
        interview_time: '',
        interview_description: '',
        is_finished: false
      };

    }

    this.isModalOpen = true;

  }

  closeModal() {
    this.isModalOpen = false;
  }

  handleImageError(event: any) {
    event.target.src = 'assets/unknown.png';
  }

}