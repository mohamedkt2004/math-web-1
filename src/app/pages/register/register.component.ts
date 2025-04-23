import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { sendEmailVerification } from 'firebase/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      school: [''],
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    const { email, password, ...profile } = this.registerForm.value;

    this.auth.register(email, password, profile).subscribe({
      next: async (user) => {
        try {
          await user.reload();
          await sendEmailVerification(user);
          alert('Registration successful. Please check your email to verify your account.');
          this.router.navigate(['/login']);
        } catch (verifyError) {
          console.error('Verification error:', verifyError);
          this.errorMessage = 'Account created but failed to send verification email.';
        }
      }
    });
  }
}
