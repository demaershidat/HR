import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModuleRoutingModule } from './module-routing-module';
import { Dashboard } from '../dashboard/dashboard';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    Dashboard,
  ],
  imports: [
    CommonModule,
    ModuleRoutingModule,
    ReactiveFormsModule
  ]
})
export class ModuleModule { }