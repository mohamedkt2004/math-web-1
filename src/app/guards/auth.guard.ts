import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    return this.auth.getCurrentUserWithRole().pipe(
      take(1),
      map(user => {
        if (!user) {
          console.log('AuthGuard: Utilisateur non connecté, redirection vers /login');
          this.router.navigate(['/login']);
          return false;
        }

        // Seuls les utilisateurs avec un rôle autre que 'Pending' sont autorisés
        if (user.role === 'Pending') {
          console.log('AuthGuard: Utilisateur en attente d\'approbation, redirection vers /pending-approval');
          this.router.navigate(['/pending-approval']);
          return false;
        }

        console.log('AuthGuard: Accès autorisé pour l\'utilisateur avec le rôle:', user.role);
        return true;
      })
    );
  }
}