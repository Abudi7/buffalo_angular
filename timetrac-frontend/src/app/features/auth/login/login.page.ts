// src/app/features/auth/login/login.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
// 👇 Import RouterModule so routerLink works in the template
import { Router, RouterModule } from '@angular/router';
// You can keep IonicModule here because we bootstrap Ionic via provideIonicAngular()
import { IonicModule, ToastController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { Login } from '../../../state/auth.actions';
import { LoginForm } from './login.model';

@Component({
  selector: 'app-login',
  standalone: true,
  // ✅ External template & styles
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  // ✅ Add RouterModule so routerLink is recognized
  imports: [CommonModule, FormsModule, RouterModule, IonicModule],
})
export class LoginPage {
  // Simple form model
  formData: LoginForm = { email: '', password: '' };

  // UI states
  loading = false;
  showPassword = false;

  constructor(
    private store: Store,
    private router: Router,
    private toast: ToastController
  ) {}

  // Toggle password visibility
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // Submit handler receives the ngForm reference
  async submit(form: NgForm) {
    // Prevent double-submit and enforce basic validation
    if (!form?.valid || this.loading) return;

    this.loading = true;
    const email = (this.formData.email || '').trim().toLowerCase();
    const password = (this.formData.password || '').trim();

    this.store.dispatch(new Login(email, password)).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/');
      },
      error: async (err) => {
        this.loading = false;
        const t = await this.toast.create({
          message: err?.error?.error || 'Login failed',
          duration: 2000,
          color: 'danger',
        });
        t.present();
      },
    });
  }
}
