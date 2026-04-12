import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { EmployeeService } from '../services/employee/employee-service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeResolver implements Resolve<any> {
  constructor(private employeeService: EmployeeService) {}

  resolve(): Observable<any> {
    return this.employeeService.getAllEmployees();
  }
}