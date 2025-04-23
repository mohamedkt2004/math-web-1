import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Database, ref, set, get, child } from '@angular/fire/database';
import { Router } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private db = inject(Database);
  private router = inject(Router);

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
        const userRef = ref(this.db, `users/${uid}`);
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
        if (!user || !user.emailVerified) {
          observer.next(null);
          observer.complete();
        } else {
          const userRef = ref(this.db, `users/${user.uid}`);
          get(userRef).then(snapshot => {
            observer.next(snapshot.val());
            observer.complete();
          });
        }
      });
    });
  }

  logout(): Promise<void> {
    return signOut(this.auth).then(() => {});
  }
}
