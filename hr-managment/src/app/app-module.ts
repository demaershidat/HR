import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './shared/shared/shared-module';
import { RouterOutlet } from "@angular/router";

@NgModule({
  declarations: [
    App,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
    RouterOutlet
],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }