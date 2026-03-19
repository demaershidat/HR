import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CandidateService } from '../services/candidate/candidate';
import { JobService } from '../services/job/job-service';

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
    private jobService: JobService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.jobService.getJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.loadData();
      },
      error: () => this.loadData()
    });
  }

  loadData() {
    this.candidateService.getAllCandidates().subscribe({
      next: (candidates) => {
        this.allCandidates = candidates;
        this.candidateService.getAllInterviews().subscribe({
          next: (data) => {
            this.allInterviewees = data.map((inv: any) => {
              const c = this.allCandidates.find(x => x.id == inv.candidate_id);
              return {
                ...inv,
                full_name: c?.full_name || '---',
                profile_image_url: c?.profile_image_url,
                display_job: this.getJobTitle(c),
                is_from_stages: inv.from_stages === 1 || inv.source === 'stages'
              };
            });
            this.interviewees = [...this.allInterviewees];
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  getJobTitle(c: any): string {
    if (!c) return '---';
    if (c.custom_job) return c.custom_job;
    const job = this.jobs.find(j => j.id == c.job_id);
    return job ? job.job_title : 'خارجي';
  }

  getCandidateName(id: any): string {
    const c = this.allCandidates.find(x => x.id == id);
    return c ? c.full_name : '';
  }

  onSearch(event: any) {
    const term = event.target.value.toLowerCase();
    if (!term) {
      this.interviewees = [...this.allInterviewees];
      return;
    }
    this.interviewees = this.allInterviewees.filter(x =>
      x.full_name?.toLowerCase().includes(term) ||
      x.display_job?.toLowerCase().includes(term)
    );
  }

  openScheduleModal(data: any = null) {
    this.errorMessage = '';
    if (data) {
      this.isEditMode = true;
      this.formData = {
        id: data.interview_id ?? data.id,
        candidate_id: data.candidate_id,
        interview_date: data.interview_date?.split('T')[0],
        interview_time: data.interview_time,
        interview_description: data.interview_description,
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
    this.errorMessage = '';
  }

  saveSchedule() {
    this.errorMessage = '';
    if (!this.formData.candidate_id) {
      this.errorMessage = 'يرجى اختيار المرشح';
      return;
    }
    if (!this.formData.interview_date) {
      this.errorMessage = 'يرجى اختيار تاريخ المقابلة';
      return;
    }
    if (!this.formData.interview_time) {
      this.errorMessage = 'يرجى اختيار وقت المقابلة';
      return;
    }

    const payload = {
      candidate_id: this.formData.candidate_id,
      interview_date: this.formData.interview_date,
      interview_time: this.formData.interview_time,
      interview_description: this.formData.interview_description,
      is_finished: this.formData.is_finished ? 1 : 0
    };

    if (this.isEditMode && this.formData.id) {
      this.candidateService.updateInterview(this.formData.id, payload)
        .subscribe({
          next: () => {
            this.loadData();
            this.closeModal();
          },
          error: (err) => {
            this.errorMessage = err?.error?.message || 'فشل تعديل المقابلة';
          }
        });
    } else {
      this.candidateService.createInterview(payload)
        .subscribe({
          next: () => {
            this.loadData();
            this.closeModal();
          },
          error: (err) => {
            this.errorMessage = err?.error?.message || 'فشل إضافة المقابلة';
          }
        });
    }
  }

  deleteInterview(item: any) {
    if (!item.interview_id) return;

    if (item.is_from_stages) {
      alert('لا يمكن حذف هذا المرشح من هنا لأنه في مرحلة المقابلات النشطة بصفحة المراحل.');
      return;
    }

    if (confirm('هل أنت متأكد من حذف هذه المقابلة؟')) {
      this.candidateService.deleteInterview(item.interview_id)
        .subscribe({
          next: () => this.loadData(),
          error: (err) => {
            alert(err?.error?.message || 'لا يمكن حذف المقابلة');
          }
        });
    }
  }

  handleImageError(event: any) {
    event.target.src = 'assets/unknown.png';
  }
}