import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Database, ref, set, get } from '@angular/fire/database';
import { sendPasswordResetEmail } from 'firebase/auth';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, catchError, delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private db = inject(Database);

  register(email: string, password: string, userProfile: any): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(userCredential => {
        const uid = userCredential.user?.uid;
        const user = userCredential.user;
        if (!uid) throw new Error('UID not found');
        const userData = {
          uid,
          email,
          emailVerified: user.emailVerified,
          role: 'Pending',
          ...userProfile
        };
        const userRef = ref(this.db, `users/${uid}`); // Correction des guillemets
        return from(set(userRef, userData)).pipe(map(() => user));
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  getCurrentUserWithRole(): Observable<any> {
    return new Observable(observer => {
      this.auth.onAuthStateChanged(user => {
        if (!user) {
          console.log('Utilisateur non connecté');
          observer.next(null);
          observer.complete();
          return;
        }

        const userRef = ref(this.db, `users/${user.uid}`);
        from(get(userRef)).subscribe({
          next: snapshot => {
            const userData = snapshot.val();
            if (userData) {
              console.log('Utilisateur chargé avec succès:', userData);
              observer.next({ uid: user.uid, ...userData });
            } else {
              console.log('Données utilisateur non trouvées pour UID:', user.uid);
              observer.next({ uid: user.uid, role: 'Pending' });
            }
            observer.complete();
          },
          error: err => {
            console.error('Erreur lors de la récupération des données utilisateur:', err);
            observer.next({ uid: user.uid, role: 'Pending' });
            observer.complete();
          }
        });
      });
    }).pipe(
      delay(100), // Ajout d'un léger délai pour s'assurer que Firebase est initialisé
      catchError(err => {
        console.error('Erreur dans getCurrentUserWithRole:', err);
        return of(null);
      })
    );
  }

  getUserData(uid: string): Observable<any> {
    const userRef = ref(this.db, `users/${uid}`); // Correction des guillemets
    return from(get(userRef)).pipe(
      map(snapshot => snapshot.val()),
      catchError(err => {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
        return of(null);
      })
    );
  }

  logout(): Promise<void> {
    return signOut(this.auth).then(() => {});
  }

  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }
}