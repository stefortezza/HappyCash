import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TokenInterceptor } from './auth/token.interceptor';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { BusinessListComponent } from './business-list/business-list.component';
import { BusinessDetailsComponent } from './business-details/business-details.component';
import { AddBusinessComponent } from './add-business/add-business.component';
import { HomeComponent } from './home/home.component';
import { RecoverComponent } from './recover/recover.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ProfiloComponent } from './profilo/profilo.component';
import { AziendeConvenzionateComponent } from './aziende-convenzionate/aziende-convenzionate.component';
import { MappaAziendeComponent } from './mappa-aziende/mappa-aziende.component';
import { BusinessLoginComponent } from './business-login/business-login.component';
import { BusinessScontiComponent } from './business-sconti/business-sconti.component';
import { SendNotificationComponent } from './send-notification/send-notification.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    NavbarComponent,
    FooterComponent,
    UserDashboardComponent,
    AdminDashboardComponent,
    BusinessListComponent,
    BusinessDetailsComponent,
    AddBusinessComponent,
    HomeComponent,
    RecoverComponent,
    ResetPasswordComponent,   
    ProfiloComponent,
    AziendeConvenzionateComponent,
    MappaAziendeComponent,
    BusinessLoginComponent,
    BusinessScontiComponent,
    SendNotificationComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule, NgbModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor, // l'interceptor esiste ed è esposto a livello i app module e qualunque chiamata http passerà da lui
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
