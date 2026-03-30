import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';

import { ModuleRoutingModule } from './module-routing-module';
import { DashboardEmp } from '../../dashboard-emp/dashboard-emp';
import { Employee } from '../../employee/employee';
import { OrganizationChart } from '../../organization-chart/organization-chart';
import { Fine } from '../../fine/fine';
import { BonusPoint } from '../../bonus-point/bonus-point';

@NgModule({
  declarations: [
    DashboardEmp,
    Employee,
    OrganizationChart,
    Fine,
    BonusPoint
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