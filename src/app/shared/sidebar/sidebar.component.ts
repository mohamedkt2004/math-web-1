import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule], // Remplace NgIf par CommonModule pour inclure toutes les directives nécessaires
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  userRole: string | null = null;
  @Output() sectionSelected = new EventEmitter<string>();

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.getCurrentUserWithRole().subscribe({
      next: (user) => {
        this.userRole = user ? user.role : null;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du rôle utilisateur:', err);
        this.userRole = null;
      }
    });
  }

  select(section: string) {
    this.sectionSelected.emit(section);
  }
}