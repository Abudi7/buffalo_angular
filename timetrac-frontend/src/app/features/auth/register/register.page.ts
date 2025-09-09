// src/app/features/auth/register/register.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
// RouterModule so routerLink works in the template
import { Router, RouterModule } from '@angular/router';
// We bootstrap Ionic globally with provideIonicAngular(); importing IonicModule here is fine
import { IonicModule, ToastController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { Register } from '../../../state/auth.actions';
import { RegisterForm } from './register.model';

@Component({
  selector: 'app-register',
  standalone: true,
  // external template & styles for clean separation
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  // standalone component imports
  imports: [CommonModule, FormsModule, RouterModule, IonicModule],
})
export class RegisterPage {
  // simple form model
  formData: RegisterForm = { email: '', password: '' };

  // UI states
  loading = false;
  showPassword = false;

  constructor(
    private store: Store,
    private router: Router,
    private toast: ToastController
  ) {}

  // toggle password visibility
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // submit handler gets the NgForm reference
  async submit(form: NgForm) {
    if (!form?.valid || this.loading) return;

    this.loading = true;
    const email = (this.formData.email || '').trim().toLowerCase();
    const password = (this.formData.password || '').trim();

    this.store.dispatch(new Register(email, password)).subscribe({
      next: () => {
        this.loading = false;
        // go to shell/home on success
        this.router.navigateByUrl('/');
      },
      error: async (err) => {
        this.loading = false;
        const t = await this.toast.create({
          message: err?.error?.error || 'Register failed',
          duration: 2200,
          color: 'danger',
        });
        t.present();
      },
    });
  }
}
