import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CandidateService } from '../services/candidate/candidate';
import { JobService } from '../services/job/job-service';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-dashboard-rec',
  templateUrl: './dashboard-rec.html',
  styleUrls: ['./dashboard-rec.css'],
  standalone: false
})
export class DashboardRec implements OnInit {
  candidates: any[] = [];
  jobs: any[] = [];
  recentCandidates: any[] = [];
  jobSkillsStats: any[] = [];
  totalVacancies: number = 0;
  advancedCandidates: number = 0;
  oarRate: string = '0.0';

  private readonly SERVER_URL = 'http://localhost:3000/uploads/';
  private readonly DEFAULT_IMAGE = 'assets/unknown.png';

  public pieChartData: ChartData<'pie'> = {
    labels: ['ارسل', 'لم يرسل', 'قبل', 'رفض', 'انضم'],
    datasets: [{ data: [0, 0, 0, 0, 0] }]
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  constructor(
    private candidateService: CandidateService,
    private jobService: JobService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.jobService.getJobs().subscribe(jobs => {
      this.jobs = jobs;
      this.candidateService.getAllCandidates().subscribe(candidates => {
        this.candidates = candidates;
        this.calculateDashboardStats();
        this.cdr.detectChanges();
      });
    });
  }

  getDisplayJobTitle(c: any): string {
    if (c.custom_job) return c.custom_job;
    const job = this.jobs.find(j => j.id == c.job_id);
    return job ? job.job_title : (c.job_title || 'غير محدد');
  }

  calculateDashboardStats() {
    this.advancedCandidates = this.candidates.length;
    const allJobTitles = new Set([
      ...this.jobs.map(j => j.job_title),
      ...this.candidates.filter(c => c.custom_job).map(c => c.custom_job)
    ]);
    this.totalVacancies = allJobTitles.size;

    const onboardingCandidates = this.candidates.filter(c => c.contract_status && c.contract_status !== '');
    
    const statusCounts = { 
      'تم الإرسال': 0, 
      'لم يرسل': 0, 
      'مقبول': 0, 
      'مرفوض': 0, 
      'تم الانضمام': 0 
    };

    onboardingCandidates.forEach(c => {
      const status = c.contract_status;
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status as keyof typeof statusCounts]++;
      }
    });

    this.pieChartData = {
      labels: ['ارسل', 'لم يرسل', 'قبل', 'رفض', 'انضم'],
      datasets: [{
        data: [
          statusCounts['تم الإرسال'],
          statusCounts['لم يرسل'],
          statusCounts['مقبول'],
          statusCounts['مرفوض'],
          statusCounts['تم الانضمام']
        ],
        backgroundColor: ['#3498db', '#ccc', '#2ecc71', '#e74c3c', '#9b59b6']
      }]
    };

    const acceptedCount = statusCounts['مقبول'] + statusCounts['تم الانضمام'];
    this.oarRate = onboardingCandidates.length > 0 ? 
      ((acceptedCount / onboardingCandidates.length) * 100).toFixed(1) : '0.0';

    const skillMap = new Map();
    this.candidates.forEach(c => {
      const title = this.getDisplayJobTitle(c);
      skillMap.set(title, (skillMap.get(title) || 0) + 1);
    });

    this.jobSkillsStats = Array.from(skillMap.entries())
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count).slice(0, 5);

    this.recentCandidates = [...this.candidates].reverse().slice(0, 7).map(can => ({
      ...can,
      display_title: this.getDisplayJobTitle(can),
      profile_image: can.profile_image_url ? this.SERVER_URL + can.profile_image_url : this.DEFAULT_IMAGE
    }));
  }

  handleImageError(event: any) {
    event.target.src = this.DEFAULT_IMAGE;
  }
}