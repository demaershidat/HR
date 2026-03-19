import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  isRecruitmentOpen: boolean = false;

  toggleRecruitment(): void {
    this.isRecruitmentOpen = !this.isRecruitmentOpen;
  }
}