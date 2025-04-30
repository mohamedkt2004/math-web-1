import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';
import { RoleManagementComponent } from '../role-management/role-management.component';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { StudentRegistrationComponent } from '../student-registration/student-registration.component';
import { StudentListComponent } from '../student-list/student-list.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  imports: [NgIf, NavBarComponent, SidebarComponent, RoleManagementComponent, StudentRegistrationComponent, StudentListComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  userRole: string | null = null;
  loading = true;
  selectedSection = 'student-register'; // default view for teachers

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.getCurrentUserWithRole().subscribe(user => {
      if (user) this.userRole = user.role;
      this.loading = false;
    });
  }

  onSectionSelected(section: string) {
    this.selectedSection = section;
  }
    
}