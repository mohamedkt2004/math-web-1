import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { RoleManagementComponent } from './pages/role-management/role-management.component';
import { AuthGuard } from './guards/auth.guard';
import { PendingApprovalComponent } from './pages/pending-approval/pending-approval.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'pending-approval', component: PendingApprovalComponent },
  { path: 'role-management', component: RoleManagementComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: 'register' } // fallback route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
