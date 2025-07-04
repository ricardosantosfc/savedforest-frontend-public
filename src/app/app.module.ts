import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AboutComponent } from './components/about/about.component';
import { HomeComponent } from './components/home/home.component';
import {AppRouteReuseStrategy} from './app-route-reuse-strategy';
import {RouteReuseStrategy} from '@angular/router';
import { ResetPwdComponent } from './components/reset-pwd/reset-pwd.component';
import { HowToPlayComponent } from './components/how-to-play/how-to-play.component';
import { FooterComponent } from './components/footer/footer.component';
import { OtherResourcesComponent } from './components/other-resources/other-resources.component';

import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MobileFormsComponent } from './components/mobile-forms/mobile-forms.component';
import { MatDialogModule } from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AboutComponent,
    HomeComponent,
    ResetPwdComponent,
    HowToPlayComponent,
    FooterComponent,
    OtherResourcesComponent,
    MobileFormsComponent   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NoopAnimationsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    BrowserAnimationsModule,
    MatProgressBarModule
  ],
  providers: [{provide: RouteReuseStrategy, useClass: AppRouteReuseStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
