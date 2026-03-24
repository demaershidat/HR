import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../service/login-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: false
})
export class Login implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isSplashing: boolean = true;

  constructor(
    private loginService: LoginService,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.isSplashing = false;
      this.cdr.detectChanges();
    }, 3800);
  }

  get emailInvalid() {
    const control = this.loginForm.get('email');
    return control ? control.invalid && control.touched : false;
  }

  get passwordInvalid() {
    const control = this.loginForm.get('password');
    return control ? control.invalid && control.touched : false;
  }

  onSubmit() { 
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.loginService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onLogout() {
    this.loginService.logout();
  }
}