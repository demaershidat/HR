import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../service/login-service';

export const guardGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.checkLoginStatus()) {
    return true;
  } else {
    router.navigate(['/auth/login']);
    return false;
  }
};