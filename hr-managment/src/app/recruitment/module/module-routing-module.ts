import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobManagment } from '../job-managment/job-managment';
import { Candidates } from '../candidates/candidates';
import { Stages } from '../stages/stages';
import { Interviews } from '../interviews/interviews';
import { Onboarding } from '../onboarding/onboarding';
import { DashboardRec } from '../dashboard-rec/dashboard-rec';
import { guardGuard } from '../../auth/guard/guard-guard';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [guardGuard],
    children: [
      { path: 'dashboardRec', component: DashboardRec },
      { path: 'jobManagment', component: JobManagment },
      { path: 'candidates', component: Candidates },
      { path: 'stages', component: Stages },
      { path: 'interviews', component: Interviews },
      { path: 'onboarding', component: Onboarding },
      { path: '', redirectTo: 'dashboardRec', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModuleRoutingModule { }