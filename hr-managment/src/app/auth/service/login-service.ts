import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = 'http://localhost:3000/login';
  private isUserLoggedIn = false;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { email, password }).pipe(
      tap(() => {
        this.isUserLoggedIn = true;
      })
    );
  }

  logout() {
    this.isUserLoggedIn = false;
    this.router.navigate(['/auth/login']);
  }

  checkLoginStatus(): boolean {
    return this.isUserLoggedIn;
  }
}