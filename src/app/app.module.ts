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
import { AuthGuard } from './autenticacao/guard/auth.guard';
import { AuthInterceptor } from './autenticacao/interceptor/auth.interceptor';
import { LoginComponent } from './autenticacao/login/login.component';
import { RegisterComponent } from './autenticacao/register/register.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SocialNetworkComponent } from './paginas/social-network/social-network.component';
import { UnauthorizedComponent } from './paginas/unauthorized/unauthorized.component';
import { FooterComponent } from './compartilhado/footer/footer.component';
import { NavbarComponent } from './compartilhado/navbar/navbar.component';
import { HomeComponent } from './paginas/home/home.component';
import { CommonLayoutComponent } from './layout/common-layout/common-layout.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { RegisterOptionsComponent } from './autenticacao/register-options/register-options.component';
import { RegisterSchoolComponent } from './autenticacao/register-school/register-school.component';
import { RegisterTeacherComponent } from './autenticacao/register-teacher/register-teacher.component';
import { RegisterTherapistComponent } from './autenticacao/register-therapist/register-therapist.component';
import { ProfileComponent } from './paginas/profile/profile.component';
import { ProfileSummaryCardComponent } from './paginas/profile/components/profile-summary-card/profile-summary-card.component';
import { ProfileEditFormComponent } from './paginas/profile/components/profile-edit-form/profile-edit-form.component';
import { ChildrenSectionComponent } from './paginas/profile/components/children-section/children-section.component';
import { ChildCardComponent } from './paginas/profile/components/child-card/child-card.component';
import { ChildCreateFormComponent } from './paginas/profile/components/child-create-form/child-create-form.component';
import { AnamnesisComponent } from './paginas/anamnesis/anamnesis.component';
import { ChildSelectorComponent } from './paginas/anamnesis/components/child-selector/child-selector.component';
import { AnamnesisEmptyStateComponent } from './paginas/anamnesis/components/anamnesis-empty-state/anamnesis-empty-state.component';
import { AnamnesisSectionShellComponent } from './paginas/anamnesis/components/anamnesis-section-shell/anamnesis-section-shell.component';
import { BirthSectionComponent } from './paginas/anamnesis/components/birth-section/birth-section.component';
import { MotorDevelopmentSectionComponent } from './paginas/anamnesis/components/motor-development-section/motor-development-section.component';
import { LanguageCommunicationSectionComponent } from './paginas/anamnesis/components/language-communication-section/language-communication-section.component';
import { HealthSectionComponent } from './paginas/anamnesis/components/health-section/health-section.component';
import { BehaviorSectionComponent } from './paginas/anamnesis/components/behavior-section/behavior-section.component';
import { RoutineSectionComponent } from './paginas/anamnesis/components/routine-section/routine-section.component';
import { GeneralNotesSectionComponent } from './paginas/anamnesis/components/general-notes-section/general-notes-section.component';
import { ChildProfileComponent } from './paginas/child-profile/child-profile.component';
import { ChildAccessCodeFormComponent } from './paginas/child-profile/components/child-access-code-form/child-access-code-form.component';
import { ChildListComponent } from './paginas/child-profile/components/child-list/child-list.component';
import { ChildProfileCardComponent } from './paginas/child-profile/components/child-card/child-card.component';
import { ChildDetailsPanelComponent } from './paginas/child-profile/components/child-details-panel/child-details-panel.component';
import { ReportsChildComponent } from './paginas/reports-child/reports-child.component';
import { ReportsChildSelectorComponent } from './paginas/reports-child/components/reports-child-selector/reports-child-selector.component';
import { ReportsChildListComponent } from './paginas/reports-child/components/reports-child-list/reports-child-list.component';
import { ReportsChildCardComponent } from './paginas/reports-child/components/reports-child-card/reports-child-card.component';
import { ReportsChildFormComponent } from './paginas/reports-child/components/reports-child-form/reports-child-form.component';
import { ReportsChildEmptyStateComponent } from './paginas/reports-child/components/reports-child-empty-state/reports-child-empty-state.component';
import { ChildObservationsComponent } from './paginas/child-observations/child-observations.component';

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
    ChildObservationsComponent,
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

