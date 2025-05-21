import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AddBusinessComponent } from './add-business/add-business.component';
import { AuthGuard } from './auth/auth.guard';
import { HomeComponent } from './home/home.component';
import { RecoverComponent } from './recover/recover.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ProfiloComponent } from './profilo/profilo.component';
import { AziendeConvenzionateComponent } from './aziende-convenzionate/aziende-convenzionate.component';
import { MappaAziendeComponent } from './mappa-aziende/mappa-aziende.component';
import { BusinessDetailsComponent } from './business-details/business-details.component';
import { BusinessScontiComponent } from './business-sconti/business-sconti.component';
import { SendNotificationComponent } from './send-notification/send-notification.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'user-dashboard', component: UserDashboardComponent, canActivate: [AuthGuard], data: { expectedRole: 'USER' } },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'add-business', component: AddBusinessComponent, canActivate: [AuthGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'recover', component: RecoverComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'profilo', component: ProfiloComponent, canActivate: [AuthGuard] },
  { path: 'aziende', component: AziendeConvenzionateComponent, canActivate: [AuthGuard] },
  { path: 'mappa-aziende', component: MappaAziendeComponent },
  { path: 'business-dashboard', component: BusinessDetailsComponent },
  { path: 'admin-send-notification', component: SendNotificationComponent },
  { path: 'sconti', component: BusinessScontiComponent, canActivate: [AuthGuard] },
  { path: 'sconti-admin/:id', component: BusinessScontiComponent, canActivate: [AuthGuard], data: { expectedRole: 'ADMIN' } },
  { path: '**', redirectTo: '' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}  
