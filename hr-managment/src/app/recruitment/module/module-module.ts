import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NgChartsModule } from 'ng2-charts';  

import { ModuleRoutingModule } from './module-routing-module';

import { JobManagment } from '../job-managment/job-managment';
import { Candidates } from '../candidates/candidates';
import { Stages } from '../stages/stages';
import { Interviews } from '../interviews/interviews';
import { Onboarding } from '../onboarding/onboarding';
import { DashboardRec } from '../dashboard-rec/dashboard-rec';

@NgModule({
  declarations: [
    DashboardRec,
    JobManagment,
    Candidates,
    Stages,
    Interviews,
    Onboarding
  ],
  imports: [
    CommonModule,
    ModuleRoutingModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgChartsModule 
  ]
})
export class ModuleModule { }