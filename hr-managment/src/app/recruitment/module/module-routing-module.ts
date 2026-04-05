import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobManagment } from '../job-managment/job-managment';
import { Candidates } from '../candidates/candidates';
import { Stages } from '../stages/stages';
import { Interviews } from '../interviews/interviews';
import { Onboarding } from '../onboarding/onboarding';
import { DashboardRec } from '../dashboard-rec/dashboard-rec';
import { guardGuard } from '../../auth/guard/guard-guard';
import { JobResolver } from '../resolvers/jobs.resolver';
import { CandidatesResolver } from '../resolvers/candidates.resolver';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [guardGuard],
    children: [
      { path: 'dashboardRec', component: DashboardRec },
      { 
        path: 'jobManagment', 
        component: JobManagment,
        resolve: { jobsData: JobResolver }
      },
      { 
        path: 'candidates', 
        component: Candidates, 
        resolve: { 
          candidatesData: CandidatesResolver,
          jobsData: JobResolver 
        } 
      },
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