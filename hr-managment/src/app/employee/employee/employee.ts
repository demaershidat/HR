import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../services/employee/employee-service';
import { JobService } from '../../recruitment/services/job/job-service';

@Component({
  selector: 'app-employee',
  standalone: false,
  templateUrl: './employee.html',
  styleUrl: './employee.css',
})
export class Employee implements OnInit {
  employees: any[] = [];
  jobs: any[] = [];
  filteredEmployees: any[] = [];
  showAddModal = false;
  isViewMode = false;
  isCustomJob = false;
  employeeForm!: FormGroup;
  activeTab: 'personal' | 'work' = 'personal';

  selectedCv: File | null = null;
  selectedPhoto: File | null = null;
  previewUrl: string | null = null;
  currentYear = new Date().getFullYear();
  searchText: string = '';

  jordanGovernorates = ['عمان', 'إربد', 'الزرقاء', 'المفرق', 'الكرك', 'معان', 'الطفيلة', 'مادبا', 'جرش', 'عجلون', 'العقبة', 'البلقاء'];
  contractTypes = ['دوام كامل', 'دوام جزئي', 'عقد محدد', 'تدريب (Intern)'];
  careerLevels = ['Junior', 'Mid-level', 'Senior', 'Lead'];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private jobService: JobService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadInitialData();
  }

  initForm() {
    const fullNamePattern = /^(\s*[^\s]+\s+){3,}[^\s]+\s*$/;
    const phonePattern = /^(07[789]\d{7})$/;

    this.employeeForm = this.fb.group({
      id: [null],
      candidate_id: [null],
      full_name: ['', [Validators.required, Validators.pattern(fullNamePattern)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(phonePattern)]],
      address: ['', Validators.required],
      birth_date: [null, Validators.required],
      age: [null, [Validators.required, Validators.min(18)]],
      job_id: [null, Validators.required],
      university_major: [''],
      graduation_year: [this.currentYear],
      custom_job: [''],
      salary: [0],
      social_security: [''],
      iban: [''],
      contract_type: ['دوام كامل'],
      department: [''],
      career_level: ['Junior'],
      status: ['active'],
      hire_date: [this.getFormattedDate(new Date())],
      assets_notes: [''],
      cv_url: [''],
      profile_image_url: ['']
    });
  }

  isWorkDataIncomplete(emp: any): boolean {
    const requiredFields = ['salary', 'contract_type', 'hire_date', 'iban', 'social_security'];
    if (emp.custom_job) {
      if (!emp.custom_job.trim()) return true;
    } else {
      if (!emp.job_id) return true;
    }
    return requiredFields.some(field => !emp[field] || emp[field] === 'null' || emp[field] === 0);
  }

  getFormattedDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  loadInitialData() {
    this.jobService.getJobs().subscribe({
      next: (jobsData) => {
        this.jobs = jobsData;
        this.loadEmployees();
      },
      error: () => this.loadEmployees()
    });
  }

  loadEmployees() {
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data.map(emp => ({
          ...emp,
          showMenu: false,
          display_job: this.getDisplayJobTitle(emp)
        }));
        this.applyFilter();
        this.cdr.detectChanges();
      }
    });
  }

  getDisplayJobTitle(emp: any): string {
    if (emp.custom_job) return emp.custom_job;
    const job = this.jobs.find(j => j.id == emp.job_id);
    return job ? job.job_title : 'غير محدد';
  }

  applyFilter() {
    const search = this.searchText.toLowerCase().trim();
    this.filteredEmployees = this.employees.filter(emp =>
      !search ||
      emp.full_name.toLowerCase().includes(search) ||
      emp.email.toLowerCase().includes(search) ||
      emp.display_job.toLowerCase().includes(search)
    );
  }

  onJobSelect(event: any) {
    this.isCustomJob = event.target.value === 'other';
    const customJobControl = this.employeeForm.get('custom_job');
    if (this.isCustomJob) {
      customJobControl?.setValidators([Validators.required]);
    } else {
      customJobControl?.clearValidators();
      customJobControl?.setValue('');
    }
    customJobControl?.updateValueAndValidity();
  }

  submitEmployee() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      if(this.employeeForm.get('full_name')?.invalid) this.activeTab = 'personal';
      return;
    }
    const formData = new FormData();
    const formValues = this.employeeForm.getRawValue();
    Object.keys(formValues).forEach(key => {
      let value = formValues[key];
      if (key === 'job_id' && value === 'other') value = null;
      if (value !== null && value !== undefined) formData.append(key, value);
    });
    if (this.selectedCv) formData.append('cvFile', this.selectedCv);
    if (this.selectedPhoto) formData.append('photoFile', this.selectedPhoto);

    const id = formValues.id;
    const request = id ? this.employeeService.updateEmployee(id, formData) : this.employeeService.addEmployee(formData);
    request.subscribe({
      next: () => { this.closeModal(); this.loadEmployees(); },
      error: () => alert('خطأ في حفظ البيانات')
    });
  }

  openAddModal() {
    this.isViewMode = false;
    this.isCustomJob = false;
    this.activeTab = 'personal';
    this.showAddModal = true;
    this.employeeForm.enable();
    this.employeeForm.reset({ 
      address: '', job_id: null, contract_type: 'دوام كامل', career_level: 'Junior', 
      status: 'active', graduation_year: this.currentYear, hire_date: this.getFormattedDate(new Date()),
      salary: 0
    });
    this.clearFiles();
  }

  editEmployee(emp: any) {
    this.isViewMode = false;
    this.showAddModal = true;
    this.activeTab = 'personal';
    this.employeeForm.enable();
    this.patchEmployeeData(emp);
    emp.showMenu = false;
  }

  viewEmployee(emp: any) {
    this.patchEmployeeData(emp);
    this.isViewMode = true;
    this.showAddModal = true;
    this.activeTab = 'personal';
    this.employeeForm.disable();
  }

  private patchEmployeeData(emp: any) {
    this.isCustomJob = !!emp.custom_job;
    this.employeeForm.patchValue({
      ...emp,
      birth_date: emp.birth_date ? this.getFormattedDate(new Date(emp.birth_date)) : null,
      hire_date: emp.hire_date ? this.getFormattedDate(new Date(emp.hire_date)) : null,
      job_id: emp.job_id || (emp.custom_job ? 'other' : null)
    });
    this.previewUrl = emp.profile_image_url ? `http://localhost:3000/uploads/${emp.profile_image_url}` : null;
  }

  deleteEmployee(id: number) {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      this.employeeService.deleteEmployee(id).subscribe(() => this.loadEmployees());
    }
  }

  onPhotoSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedPhoto = file;
      const reader = new FileReader();
      reader.onload = () => { this.previewUrl = reader.result as string; this.cdr.detectChanges(); };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.previewUrl = null;
    this.selectedPhoto = null;
    this.employeeForm.patchValue({ profile_image_url: null });
  }

  closeModal() {
    this.showAddModal = false;
    this.employeeForm.reset();
    this.clearFiles();
  }

  private clearFiles() {
    this.previewUrl = null;
    this.selectedCv = null;
    this.selectedPhoto = null;
  }

  toggleMenu(emp: any) {
    this.employees.forEach(e => { if (e !== emp) e.showMenu = false; });
    emp.showMenu = !emp.showMenu;
  }

  isInvalid(controlName: string): boolean {
    const control = this.employeeForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  handleImageError(event: any) { 
    event.target.src = 'assets/unknown.png'; 
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.menu-container') && !event.target.closest('.dots-btn')) {
      this.employees.forEach(e => e.showMenu = false);
    }
  }
}