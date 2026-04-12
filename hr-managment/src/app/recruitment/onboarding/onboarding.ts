import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CandidateService } from '../services/candidate/candidate';
import { JobService } from '../services/job/job-service';
import { StageService } from '../services/stage/stage';
import { forkJoin } from 'rxjs';
import { EmployeeService } from '../../employee/services/employee/employee-service';

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
    private employeeService: EmployeeService,
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
        .filter(s => Number(s.is_final) === 1 || s.is_final === true)
        .map(s => Number(s.id));

      this.hiredCandidates = data
        .filter(c => finalStageIds.includes(Number(c.current_stage)) && c.contract_status !== 'تم الانضمام')
        .map(c => ({
          ...c,
          contract_status: c.contract_status || 'لم يرسل',
          display_job: this.getJobTitle(c)
        }));
      this.cdr.detectChanges();
    });
  }

  getJobTitle(c: any) {
    if (c.custom_job && c.custom_job.trim() !== '') return c.custom_job;
    const job = this.jobs.find(j => Number(j.id) === Number(c.job_id));
    return job ? job.job_title : 'غير محدد';
  }

  onStatusChange(candidate: any, newStatus: string) {
    candidate.contract_status = newStatus;
    this.candidateService.updateCandidate(candidate.id, { contract_status: newStatus }).subscribe({
      next: () => {
        if (newStatus === 'تم الانضمام') {
          const formData = new FormData();
          const employeeData: any = {
            candidate_id: candidate.id,
            full_name: candidate.full_name,
            email: candidate.email,
            phone: candidate.phone,
            address: candidate.address,
            birth_date: candidate.birth_date ? candidate.birth_date.split('T')[0] : null,
            age: candidate.age,
            university_major: candidate.university_major,
            graduation_year: candidate.graduation_year,
            job_id: candidate.job_id || null,
            custom_job: candidate.custom_job || null,
            salary: candidate.expected_salary || 0,
            profile_image_url: candidate.profile_image_url,
            cv_url: candidate.cv_url,
            status: 'active',
            contract_type: 'دوام كامل',
            career_level: 'Junior'
          };

          Object.keys(employeeData).forEach(key => {
            if (employeeData[key] !== null && employeeData[key] !== undefined) {
              formData.append(key, employeeData[key]);
            }
          });

          this.employeeService.addEmployee(formData).subscribe({
            next: () => {
              this.hiredCandidates = this.hiredCandidates.filter(c => c.id !== candidate.id);
              this.cdr.detectChanges();
            }
          });
        }
        this.cdr.detectChanges();
      }
    });
  }

  handleImageError(event: any) { 
    (event.target as HTMLImageElement).src = 'assets/unknown.png'; 
  }
}