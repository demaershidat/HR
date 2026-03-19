import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { guardGuard } from './auth/guard/guard-guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/module/login/login-module').then(m => m.LoginModule)
  },
  {
    path: 'dashboard',  
    canActivate: [guardGuard],
    loadChildren: () => import('./dashboard/module/module-module').then(m => m.ModuleModule)
  },
  {
    path: 'recruitment',
    canActivate: [guardGuard],
    loadChildren: () => import('./recruitment/module/module-module').then(m => m.ModuleModule)
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }