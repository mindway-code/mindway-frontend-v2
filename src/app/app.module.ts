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
    HomeComponent,
    CommonLayoutComponent,
    DashboardLayoutComponent


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
