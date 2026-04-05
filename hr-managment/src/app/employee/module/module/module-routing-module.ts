import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { guardGuard } from '../../../auth/guard/guard-guard';
import { DashboardEmp } from '../../dashboard-emp/dashboard-emp';
import { BonusPoint } from '../../bonus-point/bonus-point';
import { Employee } from '../../employee/employee';
import { Fine } from '../../fine/fine';
import { OrganizationChart } from '../../organization-chart/organization-chart';
import { EmployeeResolver } from '../../resolvers/employee.resolver';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [guardGuard],
    children: [
      { path: 'dashboardEmp', component: DashboardEmp },
     { 
        path: 'employee', 
        component: Employee,
        resolve: { employeesData: EmployeeResolver } // ربط الـ Resolver هنا
      },
      { path: 'organization-chart', component: OrganizationChart},
      { path: 'fine', component: Fine },
      { path: 'bonus-point', component: BonusPoint },
      { path: '', redirectTo: 'dashboardEmp', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModuleRoutingModule { }
