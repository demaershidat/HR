import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; 
import { EmployeeService } from '../services/employee/employee-service';

@Component({
  selector: 'app-employee',
  standalone: false,
  templateUrl: './employee.html',
  styleUrl: './employee.css',
})
export class Employee implements OnInit {
  employees: any[] = [];
  joinedCount: number = 0;
  loading = false; 
  searchText: string = '';
  selectedEmployeeFilter: any = 'all';
  selectedJobFilter: any = 'all';

  constructor(
    private route: ActivatedRoute, 
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    const data = this.route.snapshot.data['employeesData'] || [];
    this.employees = data.map((emp: any) => ({ ...emp, showMenu: false }));
    this.joinedCount = this.employees.length;
  }

  get filteredEmployees() {
    return this.employees.filter(c => {
      const matchesSearch = !this.searchText || 
                            c.full_name.toLowerCase().includes(this.searchText.toLowerCase()) || 
                            c.email.toLowerCase().includes(this.searchText.toLowerCase());
      
      const matchesJob = this.selectedEmployeeFilter === 'all' || 
                         c.job_id == this.selectedJobFilter;
      
      return matchesSearch && matchesJob;
    });
  }

  toggleMenu(emp: any) {
    this.employees.forEach(e => {
      if (e !== emp) e.showMenu = false;
    });
    emp.showMenu = !emp.showMenu;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.card-options-container')) {
      this.employees.forEach(e => e.showMenu = false);
    }
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data.map((emp: any) => ({ ...emp, showMenu: false }));
        this.joinedCount = this.employees.length;
      }
    });
  }

  deleteEmp(id: number) {
    if(confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      this.employeeService.deleteEmployee(id).subscribe(() => {
        this.loadEmployees(); 
      });
    }
  }

  viewDetails(emp: any) {
    console.log('Viewing details for:', emp);
  }

  editEmployee(emp: any) {
    console.log('Editing employee:', emp);
  }

  openAddModal() {
    console.log('Opening add modal');
  }

  handleImageError(event: any) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/unknown.png';
  }
}