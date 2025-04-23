import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-role-management',
  imports: [],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.css'
})
export class RoleManagementComponent {
  pendingUsers: any[] = [];
  loading = true;

  constructor(private db: AngularFireDatabase) {}

  ngOnInit(): void {
    this.db.list('users', ref => ref.orderByChild('role').equalTo('Pending'))
      .valueChanges()
      .subscribe(users => {
        this.pendingUsers = users;
        this.loading = false;
      });
  }

  assignRole(uid: string, newRole: string) {
    this.db.object(`users/${uid}/role`).set(newRole);
  }
}
