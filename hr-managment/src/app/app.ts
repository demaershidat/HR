import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: false
})
export class App implements OnInit {
  showHeaderFooter: boolean = false; 

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(() => {
      const currentRoute = this.router.url;
      if (currentRoute.includes('/auth/login') || currentRoute === '/') {
        this.showHeaderFooter = false;
      } else {
        this.showHeaderFooter = true;
      }
    });
  }
}