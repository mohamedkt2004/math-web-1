import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Database, ref, get, set, query, orderByChild, equalTo } from '@angular/fire/database';
import { from } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.css'
})
export class RoleManagementComponent {
  pendingUsers: any[] = [];
  loading = true;
  userRole: string | null = null;

  constructor(private db: Database, private auth: AuthService) {}

  ngOnInit(): void {
    const pendingUsersQuery = query(ref(this.db, 'users'), orderByChild('role'), equalTo('Pending'));

    from(get(pendingUsersQuery)).subscribe({
      next: snapshot => {
        const users = snapshot.val();
        this.pendingUsers = users ? Object.values(users) : [];
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching pending users', err);
        this.loading = false;
      }
    });

    this.auth.getCurrentUserWithRole().subscribe(user => {
      if (user) this.userRole = user.role;
    });
  }

  assignRole(uid: string, newRole: string) {
    set(ref(this.db, `users/${uid}/role`), newRole);
  }
}