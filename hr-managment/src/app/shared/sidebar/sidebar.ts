import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  isRecruitmentOpen: boolean = false;
  isEmployeesOpen: boolean = false;

  toggleRecruitment(): void {
    this.isRecruitmentOpen = !this.isRecruitmentOpen;
    if (this.isRecruitmentOpen) {
      this.isEmployeesOpen = false;
    }
  }

  toggleEmployees(): void {
    this.isEmployeesOpen = !this.isEmployeesOpen;
    if (this.isEmployeesOpen) {
      this.isRecruitmentOpen = false;
    }
  }
}