import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Standalone Ionic components
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonSplitPane,
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonRouterOutlet,
  IonChip,
  IonAvatar,
  IonLabel,
  IonButton,
  IonIcon,
  IonListHeader,
} from '@ionic/angular/standalone';

// Ionic services
import { MenuController, ToastController } from '@ionic/angular';

import { Store } from '@ngxs/store';
import { AuthState } from '../state/auth.state';
import { map } from 'rxjs/operators';
import { Logout } from '../state/auth.actions';
import { I18nService } from '../core/i18n.service';

@Component({
  selector: 'app-main-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonSplitPane, IonMenu, IonContent, IonList, IonItem, IonRouterOutlet,
    IonChip, IonAvatar, IonLabel, IonButton, IonIcon,
  ],
  templateUrl: './main-shell.component.html',
  styleUrls: ['./main-shell.component.scss'],
})
export class MainShellComponent {
  private store = inject(Store);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);
  private toast = inject(ToastController);
  private i18n = inject(I18nService);

  userEmail$ = this.store.select(AuthState.user).pipe(map(u => u?.email ?? ''));

  constructor() {}

  avatarFor(email: string) {
    const seed = encodeURIComponent(email || 'user');
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`;
  }

  onLogout() {
    this.store.dispatch(new Logout()).subscribe({
      next: async () => {
        await this.menuCtrl.close();
        this.router.navigateByUrl('/login');
      },
      error: async () => {
        await this.menuCtrl.close();
        const t = await this.toast.create({ message: 'Logged out', duration: 1200 });
        t.present();
        this.router.navigateByUrl('/login');
      },
    });
  }

  cycleLang() {
    const order: ('en'|'ar'|'de')[] = ['en','ar','de'];
    const current = this.i18n.lang;
    const next = order[(order.indexOf(current) + 1) % order.length];
    this.i18n.setLang(next);
  }
}
