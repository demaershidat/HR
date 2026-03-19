import { Component } from '@angular/core';
import { LoginService } from '../../auth/service/login-service';


@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(private loginService: LoginService) {}

  logout() {
    this.loginService.logout();
  }
}