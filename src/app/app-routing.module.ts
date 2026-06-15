import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonLayoutComponent } from './layout/common-layout/common-layout.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard } from './auth/guard/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { SocialNetworkComponent } from './pages/social-network/social-network.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { RegisterOptionsComponent } from './auth/register-options/register-options.component';
import { RegisterSchoolComponent } from './auth/register-school/register-school.component';
import { RegisterTeacherComponent } from './auth/register-teacher/register-teacher.component';
import { RegisterTherapistComponent } from './auth/register-therapist/register-therapist.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AnamnesisComponent } from './pages/anamnesis/anamnesis.component';
import { ChildProfileComponent } from './pages/child-profile/child-profile.component';
import { ReportsChildComponent } from './pages/reports-child/reports-child.component';
import { DashboradComponent } from './pages/dashborad/dashborad.component';
import { LinkSchoolComponent } from './auth/link-school/link-school.component';
import { LinkProfessionalComponent } from './auth/link-professional/link-professional.component';
import { LinkTherapistComponent } from './auth/link-therapist/link-therapist.component';

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
    component: CommonLayoutComponent,
     canActivate: [AuthGuard],
    children: [
      { path: '', component: ProfileComponent, pathMatch: 'full' },
    ],
  },
  {
    path: 'link-school',
    children: [
      { path: '', component: LinkSchoolComponent, pathMatch: 'full' },
    ],
  },
  {
    path: 'link-professional',
    children: [
      { path: '', component: LinkProfessionalComponent, pathMatch: 'full' },
    ],
  },
  {
    path: 'link-therapist',
    children: [
      { path: '', component: LinkTherapistComponent, pathMatch: 'full' },
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
    children: [{ path: '', component: ChildProfileComponent, pathMatch: 'full' }],
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: DashboradComponent, pathMatch: 'full' }],
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
