import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { HomeComponent } from './components/home/home.component';
import { HowToPlayComponent } from './components/how-to-play/how-to-play.component';
import { OtherResourcesComponent } from './components/other-resources/other-resources.component';
import { ResetPwdComponent } from './components/reset-pwd/reset-pwd.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'howToPlay', component: HowToPlayComponent },
  { path: 'otherResources', component: OtherResourcesComponent },
  { path: 'resetPwdToken/:token/:id', component: ResetPwdComponent} 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
