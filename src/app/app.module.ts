import { AsyncPipe, CommonModule, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { NgxEditorModule } from 'ngx-editor';
import { AuthGuard } from './auth/guard/auth.guard';
import { AuthInterceptor } from './auth/interceptor/auth.interceptor';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SocialNetworkComponent } from './pages/social-network/social-network.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { FooterComponent } from './shared/footer/footer.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { HomeComponent } from './pages/home/home.component';
import { CommonLayoutComponent } from './layout/common-layout/common-layout.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { RegisterOptionsComponent } from './auth/register-options/register-options.component';
import { RegisterSchoolComponent } from './auth/register-school/register-school.component';
import { RegisterTeacherComponent } from './auth/register-teacher/register-teacher.component';
import { RegisterTherapistComponent } from './auth/register-therapist/register-therapist.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfileSummaryCardComponent } from './pages/profile/components/profile-summary-card/profile-summary-card.component';
import { ProfileEditFormComponent } from './pages/profile/components/profile-edit-form/profile-edit-form.component';
import { ChildrenSectionComponent } from './pages/profile/components/children-section/children-section.component';
import { ChildCardComponent } from './pages/profile/components/child-card/child-card.component';
import { ChildCreateFormComponent } from './pages/profile/components/child-create-form/child-create-form.component';
import { AnamnesisComponent } from './pages/anamnesis/anamnesis.component';
import { ChildSelectorComponent } from './pages/anamnesis/components/child-selector/child-selector.component';
import { AnamnesisEmptyStateComponent } from './pages/anamnesis/components/anamnesis-empty-state/anamnesis-empty-state.component';
import { AnamnesisSectionShellComponent } from './pages/anamnesis/components/anamnesis-section-shell/anamnesis-section-shell.component';
import { BirthSectionComponent } from './pages/anamnesis/components/birth-section/birth-section.component';
import { MotorDevelopmentSectionComponent } from './pages/anamnesis/components/motor-development-section/motor-development-section.component';
import { LanguageCommunicationSectionComponent } from './pages/anamnesis/components/language-communication-section/language-communication-section.component';
import { HealthSectionComponent } from './pages/anamnesis/components/health-section/health-section.component';
import { BehaviorSectionComponent } from './pages/anamnesis/components/behavior-section/behavior-section.component';
import { RoutineSectionComponent } from './pages/anamnesis/components/routine-section/routine-section.component';
import { GeneralNotesSectionComponent } from './pages/anamnesis/components/general-notes-section/general-notes-section.component';
import { ChildProfileComponent } from './pages/child-profile/child-profile.component';
import { ChildAccessCodeFormComponent } from './pages/child-profile/components/child-access-code-form/child-access-code-form.component';
import { ChildListComponent } from './pages/child-profile/components/child-list/child-list.component';
import { ChildProfileCardComponent } from './pages/child-profile/components/child-card/child-card.component';
import { ChildDetailsPanelComponent } from './pages/child-profile/components/child-details-panel/child-details-panel.component';
import { ReportsChildComponent } from './pages/reports-child/reports-child.component';
import { ReportsChildSelectorComponent } from './pages/reports-child/components/reports-child-selector/reports-child-selector.component';
import { ReportsChildListComponent } from './pages/reports-child/components/reports-child-list/reports-child-list.component';
import { ReportsChildCardComponent } from './pages/reports-child/components/reports-child-card/reports-child-card.component';
import { ReportsChildFormComponent } from './pages/reports-child/components/reports-child-form/reports-child-form.component';
import { ReportsChildEmptyStateComponent } from './pages/reports-child/components/reports-child-empty-state/reports-child-empty-state.component';
import { LinkSchoolComponent } from './auth/link-school/link-school.component';
import { LinkProfessionalComponent } from './auth/link-professional/link-professional.component';
import { LinkTherapistComponent } from './auth/link-therapist/link-therapist.component';
import { LinkClinicComponent } from './auth/link-clinic/link-clinic.component';
import { DashboradComponent } from './pages/dashborad/dashborad.component';

registerLocaleData(localePt);

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    UnauthorizedComponent,
    SocialNetworkComponent,
    LoginComponent,
    RegisterComponent,
    RegisterOptionsComponent,
    RegisterSchoolComponent,
    RegisterTeacherComponent,
    RegisterTherapistComponent,
    ProfileComponent,
    ProfileSummaryCardComponent,
    ProfileEditFormComponent,
    ChildrenSectionComponent,
    ChildCardComponent,
    ChildCreateFormComponent,
    HomeComponent,
    AnamnesisComponent,
    ChildSelectorComponent,
    AnamnesisEmptyStateComponent,
    AnamnesisSectionShellComponent,
    BirthSectionComponent,
    MotorDevelopmentSectionComponent,
    LanguageCommunicationSectionComponent,
    HealthSectionComponent,
    BehaviorSectionComponent,
    RoutineSectionComponent,
    GeneralNotesSectionComponent,
    CommonLayoutComponent,
    DashboardLayoutComponent,
    ChildProfileComponent,
    ChildAccessCodeFormComponent,
    ChildListComponent,
    ChildProfileCardComponent,
    ChildDetailsPanelComponent,
    ReportsChildComponent,
    ReportsChildSelectorComponent,
    ReportsChildListComponent,
    ReportsChildCardComponent,
    ReportsChildFormComponent,
    ReportsChildEmptyStateComponent,
    LinkSchoolComponent,
    LinkClinicComponent,
    LinkProfessionalComponent,
    LinkTherapistComponent,
    DashboradComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    NgxEditorModule,
    FormsModule,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    AsyncPipe
  ],
  providers: [
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
