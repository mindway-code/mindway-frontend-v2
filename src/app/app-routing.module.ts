import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonLayoutComponent } from './layout/common-layout/common-layout.component';
import { LoginComponent } from './autenticacao/login/login.component';
import { RegisterComponent } from './autenticacao/register/register.component';
import { AuthGuard } from './autenticacao/guard/auth.guard';
import { HomeComponent } from './paginas/home/home.component';
import { SocialNetworkComponent } from './paginas/social-network/social-network.component';
import { UnauthorizedComponent } from './paginas/unauthorized/unauthorized.component';
import { RegisterOptionsComponent } from './autenticacao/register-options/register-options.component';
import { RegisterSchoolComponent } from './autenticacao/register-school/register-school.component';
import { RegisterTeacherComponent } from './autenticacao/register-teacher/register-teacher.component';
import { RegisterTherapistComponent } from './autenticacao/register-therapist/register-therapist.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { ProfileComponent } from './paginas/profile/profile.component';
import { AnamnesisComponent } from './paginas/anamnesis/anamnesis.component';
import { ChildProfileComponent } from './paginas/child-profile/child-profile.component';
import { ReportsChildComponent } from './paginas/reports-child/reports-child.component';
import { ChildObservationsComponent } from './paginas/child-observations/child-observations.component';

const routes: Routes = [
  // Rotas com layout comum (navbar/footer)
  {
    path: '',
    component: CommonLayoutComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'social-network', component: SocialNetworkComponent, canActivate: [AuthGuard] },
    ],
  },
  {
    path: 'profile',
    component: DashboardLayoutComponent,
     canActivate: [AuthGuard],
    children: [
      { path: '', component: ProfileComponent, pathMatch: 'full' },
      { path: 'social-network', component: SocialNetworkComponent },
    ],
  },
  {
    path: 'anamnesis',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: AnamnesisComponent, pathMatch: 'full' }],
  },
  {
    path: 'child-profile',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ChildProfileComponent, pathMatch: 'full' },
      { path: 'observations', component: ChildObservationsComponent, pathMatch: 'full' },
    ],
  },
  {
    path: 'reports-child',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: ReportsChildComponent, pathMatch: 'full' }],
  },
  { path: 'children/:childId/anamnesis', redirectTo: 'anamnesis', pathMatch: 'full' },

  // Rotas fora do layout comum
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-options', component: RegisterOptionsComponent },
  { path: 'register-school', component: RegisterSchoolComponent },
  { path: 'register-teacher', component: RegisterTeacherComponent },
  { path: 'register-therapist', component: RegisterTherapistComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },

  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

