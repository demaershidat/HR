import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CandidateService } from '../services/candidate/candidate';
import { JobService } from '../services/job/job-service';

@Component({
  selector: 'app-candidates',
  standalone: false,
  templateUrl: './candidates.html',
  styleUrl: './candidates.css',
})
export class Candidates implements OnInit {
  candidates: any[] = [];
  jobs: any[] = [];
  showAddModal = false;
  isViewMode = false;
  isCustomJob = false;
  candidateForm!: FormGroup;
  selectedCv: File | null = null;
  selectedPhoto: File | null = null;
  previewUrl: string | null = null;
  photoWasRemoved = false;
  currentYear = new Date().getFullYear();

  jordanGovernorates = ['عمان', 'إربد', 'الزرقاء', 'المفرق', 'الكرك', 'معان', 'الطفيلة', 'مادبا', 'جرش', 'عجلون', 'العقبة', 'البلقاء'];

  constructor(
    private fb: FormBuilder, 
    private candidateService: CandidateService, 
    private jobService: JobService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadInitialData();
  }

  initForm() {
    this.candidateForm = this.fb.group({
      id: [null],
      full_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', Validators.required],
      university_major: ['', Validators.required],
      graduation_year: ['', [Validators.required]],
      job_id: [null],
      custom_job: [''],
      has_experience: [false],
      exp_company_name: [''],
      exp_position: [''],
      exp_period: [''],
      cv_url: [''],
      profile_image_url: [''],
      current_stage: [null]
    });
  }

  loadInitialData() {
    this.jobService.getJobs().subscribe({
      next: (data) => {
        this.jobs = data;
        this.loadCandidates();
      }
    });
  }

  loadCandidates() {
    this.candidateService.getAllCandidates().subscribe({
      next: (data) => {
        this.candidates = data.map(c => ({ ...c, showMenu: false }));
        this.cdr.detectChanges();
      }
    });
  }

  getDisplayJobTitle(c: any): string {
    if (c.custom_job) return c.custom_job;
    const job = this.jobs.find(j => j.id == c.job_id);
    return job ? job.job_title : (c.job_title || 'لم يحدد');
  }

  openAddModal() {
    this.isViewMode = false;
    this.isCustomJob = false;
    this.photoWasRemoved = false;
    this.showAddModal = true;
    this.candidateForm.enable();
    this.candidateForm.reset({ has_experience: false, address: '', job_id: null });
    this.previewUrl = null;
    this.selectedCv = null;
    this.selectedPhoto = null;
  }

  editCandidate(candidate: any) {
    this.isViewMode = false;
    this.showAddModal = true;
    this.photoWasRemoved = false;
    this.candidateForm.enable();
    this.isCustomJob = !!candidate.custom_job;
    this.candidateForm.patchValue({
      ...candidate,
      job_id: candidate.job_id || (candidate.custom_job ? 'other' : null)
    });
    this.previewUrl = null;
    candidate.showMenu = false;
  }

  submitCandidate() {
    if (this.candidateForm.invalid) {
      this.candidateForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const formValues = this.candidateForm.getRawValue();

    Object.keys(formValues).forEach(key => {
      if (formValues[key] !== null && formValues[key] !== undefined) {
        formData.append(key, formValues[key]);
      }
    });

    if (this.selectedCv) formData.append('cvFile', this.selectedCv);
    if (this.selectedPhoto) formData.append('photoFile', this.selectedPhoto);
    if (this.photoWasRemoved && !this.selectedPhoto) formData.append('removePhoto', 'true');

    const id = formValues.id;
    const request = id 
      ? this.candidateService.updateCandidate(id, formData) 
      : this.candidateService.addCandidate(formData);

    request.subscribe(() => {
      this.closeModal();
      this.loadInitialData();
    });
  }

  removeImage() {
    this.previewUrl = null;
    this.selectedPhoto = null;
    this.photoWasRemoved = true;
    this.candidateForm.patchValue({ profile_image_url: null });
    this.cdr.detectChanges();
  }

  onPhotoSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedPhoto = file;
      this.photoWasRemoved = false;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.candidateForm.reset();
    this.previewUrl = null;
    this.selectedCv = null;
    this.selectedPhoto = null;
    this.photoWasRemoved = false;
  }

  viewCandidate(c: any) {
    this.isViewMode = true;
    this.showAddModal = true;
    this.candidateForm.patchValue(c);
    this.candidateForm.disable();
    c.showMenu = false;
  }

  toggleMenu(event: Event, c: any) {
    event.stopPropagation();
    this.candidates.forEach(x => { if (x !== c) x.showMenu = false; });
    c.showMenu = !c.showMenu;
  }

  handleImageError(event: any) { event.target.src = 'assets/unknown.png'; }
  onJobSelect(event: any) { this.isCustomJob = event.target.value === 'other'; }
  onFileSelect(event: any) { if (event.target.files.length > 0) this.selectedCv = event.target.files[0]; }
  confirmDelete(id: number) { if (confirm('حذف؟')) this.candidateService.deleteCandidate(id).subscribe(() => this.loadCandidates()); }
}