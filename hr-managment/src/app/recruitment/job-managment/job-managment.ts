import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobService } from '../services/job/job-service';
import { CandidateService } from '../services/candidate/candidate';

@Component({
  selector: 'app-job-managment',
  templateUrl: './job-managment.html',
  styleUrls: ['./job-managment.css'],
  standalone: false
})
export class JobManagment implements OnInit {

  activeDropdown: number | null = null;

  jobForm!: FormGroup;
  applyForm!: FormGroup;
  isModalOpen = false;
  isApplyModalOpen = false;
  jobs: any[] = [];
  selectedJob: any = null;
  selectedJobIds: number[] = [];
  previewUrl: string | null = null;
  today = new Date().toISOString().split('T')[0];
  currentYear = new Date().getFullYear();
  currentEditId: number | null = null;
  formSubmitted = false;
  applySubmitted = false;

  jordanGovernorates = ['عمان', 'إربد', 'الزرقاء', 'المفرق', 'الكرك', 'معان', 'الطفيلة', 'مادبا', 'جرش', 'عجلون', 'العقبة', 'البلقاء'];

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private candidateService: CandidateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadJobs();
  }

toggleDropdown(id: number) {
  this.activeDropdown = this.activeDropdown === id ? null : id;
}

@HostListener('document:click', ['$event'])
closeDropdownOutside(event: any) {
  if (!event.target.closest('.dropdown-actions')) {
    this.activeDropdown = null;
  }
}

  initForms() {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      companyName: ['Solid Soft', Validators.required],
      description: ['', Validators.required],
      publishDate: [this.today, Validators.required],
      expiryDate: ['', Validators.required],
      allowProfileImage: [false],
      allowResume: [false]
    });

    this.applyForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern(/^(\s*[\u0600-\u06FFa-zA-Z]+\s+){3,}[\u0600-\u06FFa-zA-Z]+\s*$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^07[789]\d{7}$/)]],
      address: ['', Validators.required],
      major: ['', Validators.required],
      graduationYear: ['', [Validators.required, Validators.min(2010), Validators.max(this.currentYear)]],
      hasExperience: [false],
      expCompany: [''],
      expPosition: [''],
      expPeriod: [''],
      cvFile: [null],
      photoFile: [null]
    });
  }

  isInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    const isSubmitted = form === this.jobForm ? this.formSubmitted : this.applySubmitted;
    return !!(control && control.invalid && (control.touched || control.dirty || isSubmitted));
  }

  getErrorMessage(form: FormGroup, controlName: string): string {
    const control = form.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) return 'هذا الحقل مطلوب';
      if (control.errors['email']) return 'البريد الإلكتروني غير صحيح';
      if (control.errors['pattern'] && controlName === 'fullName') return 'يجب إدخال الاسم الرباعي على الأقل';
      if (control.errors['pattern'] && controlName === 'phone') return 'رقم الهاتف غير صحيح';
      if (control.errors['min'] || control.errors['max']) return `السنة بين 2010 و ${this.currentYear}`;
    }
    return '';
  }

  loadJobs() {
    this.jobService.getJobs().subscribe({
      next: (data) => { this.jobs = data; this.cdr.detectChanges(); },
      error: (err) => console.error(err)
    });
  }

  openModal() {
    this.isModalOpen = true;
    this.currentEditId = null;
    this.formSubmitted = false;
    this.jobForm.reset({ companyName: 'Solid Soft', publishDate: this.today, allowProfileImage: false, allowResume: false });
  }

  closeModal() { this.isModalOpen = false; this.formSubmitted = false; }

  editJob(job: any) {
    this.currentEditId = job.id;
    this.isModalOpen = true;
    this.formSubmitted = false;
    this.jobForm.patchValue({
      title: job.job_title,
      companyName: job.company_name,
      description: job.job_description,
      publishDate: job.publish_date?.split('T')[0],
      expiryDate: job.expiry_date?.split('T')[0],
      allowProfileImage: job.require_profile_image == 1,
      allowResume: job.require_cv == 1
    });
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.jobForm.invalid) return;
    const formValue = this.jobForm.value;
    const payload = {
      job_title: formValue.title,
      company_name: formValue.companyName,
      job_description: formValue.description,
      publish_date: formValue.publishDate,
      expiry_date: formValue.expiryDate,
      require_cv: formValue.allowResume ? 1 : 0,
      require_profile_image: formValue.allowProfileImage ? 1 : 0
    };
    const request = this.currentEditId ? this.jobService.updateJob(this.currentEditId, payload) : this.jobService.saveJob(payload);
    request.subscribe({
      next: () => { this.loadJobs(); this.closeModal(); },
      error: () => alert('حدث خطأ أثناء الحفظ')
    });
  }

  openApplyModal(job: any) {
    this.selectedJob = job;
    this.isApplyModalOpen = true;
    this.applySubmitted = false;
    this.previewUrl = null;
    this.applyForm.reset({ hasExperience: false, address: '' });
    
    if (job.require_cv) {
      this.applyForm.get('cvFile')?.setValidators(Validators.required);
    } else {
      this.applyForm.get('cvFile')?.clearValidators();
    }
    
    if (job.require_profile_image) {
      this.applyForm.get('photoFile')?.setValidators(Validators.required);
    } else {
      this.applyForm.get('photoFile')?.clearValidators();
    }
    
    this.applyForm.get('cvFile')?.updateValueAndValidity();
    this.applyForm.get('photoFile')?.updateValueAndValidity();
  }

  closeApplyModal() { this.isApplyModalOpen = false; this.selectedJob = null; this.applySubmitted = false; this.previewUrl = null; }

  onFileChange(event: any, type: string) {
    const file = event.target.files[0];
    if (!file) return;

    if (type === 'cv') {
      if (file.type !== 'application/pdf') {
        alert('يرجى اختيار ملف بصيغة PDF فقط');
        event.target.value = '';
        this.applyForm.patchValue({ cvFile: null });
        return;
      }
      this.applyForm.patchValue({ cvFile: file });
      this.applyForm.get('cvFile')?.updateValueAndValidity();
    } else if (type === 'photo') {
      this.applyForm.patchValue({ photoFile: file });
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.applyForm.patchValue({ photoFile: null });
    this.previewUrl = null;
    this.cdr.detectChanges();
  }

  handleImageError(event: any) {
    event.target.src = 'assets/unknown.png';
  }

  onApplySubmit() {
    this.applySubmitted = true;
    if (this.applyForm.invalid) { this.applyForm.markAllAsTouched(); return; }
    
    const formData = new FormData();
    const val = this.applyForm.value;
    
    formData.append('full_name', val.fullName);
    formData.append('email', val.email);
    formData.append('phone', val.phone);
    formData.append('address', val.address);
    formData.append('university_major', val.major);
    formData.append('graduation_year', val.graduationYear);
    formData.append('job_id', this.selectedJob.id.toString());
    formData.append('has_experience', val.hasExperience ? '1' : '0');
    formData.append('exp_company_name', val.expCompany || '');
    formData.append('exp_position', val.expPosition || '');
    formData.append('exp_period', val.expPeriod || '');
    
    if (val.cvFile) formData.append('cvFile', val.cvFile);
    if (val.photoFile) formData.append('photoFile', val.photoFile);

    this.candidateService.addCandidate(formData).subscribe({
      next: () => { alert('تم تقديم الطلب بنجاح'); this.closeApplyModal(); },
      error: () => alert('خطأ في الإرسال')
    });
  }

  onDeleteJob(id: number) {
    if (confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) {
      this.jobService.deleteJob(id).subscribe(() => this.loadJobs());
    }
  }

  toggleSelection(jobId: number) {
    const index = this.selectedJobIds.indexOf(jobId);
    if (index > -1) this.selectedJobIds.splice(index, 1);
    else this.selectedJobIds.push(jobId);
  }

  deleteSelected() {
    if (this.selectedJobIds.length === 0) return;
    if (confirm('هل أنت متأكد من حذف الوظائف المحددة؟')) {
      this.selectedJobIds.forEach(id => this.jobService.deleteJob(id).subscribe(() => this.loadJobs()));
      this.selectedJobIds = [];
    }
  }

  isJobActive(job: any): boolean {
    if (!job.expiry_date) return true;
    return new Date() <= new Date(job.expiry_date);
  }
}