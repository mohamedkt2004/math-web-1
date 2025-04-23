import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';
import { ref, get, Database } from '@angular/fire/database';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.auth.login(email, password).subscribe({
      next: async (userCredential) => {
        const user = userCredential.user;
        await user.reload();

        if (!user.emailVerified) {
          this.loading = false;
          this.errorMessage = 'Please verify your email before continuing.';
          return;
        }

        const userSnapshot = await get(ref(this.auth['db'], `users/${user.uid}`));
        const userData = userSnapshot.val();

        if (!userData || userData.role === 'Pending') {
          this.router.navigate(['/pending-approval']);
        } else {
          this.router.navigate(['/dashboard']); 
        }        
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.message;
      }
    });
  }
}