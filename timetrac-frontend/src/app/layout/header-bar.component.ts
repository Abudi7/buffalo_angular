import { Component, Input, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonChip, IonAvatar, IonLabel, IonButton
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { AuthState } from '../state/auth.state';
import { map } from 'rxjs/operators';
import { Logout } from '../state/auth.actions';

/**
 * Global app header with:
 * - Menu button (for split-pane/side menu)
 * - Title (passed as @Input)
 * - User chip with avatar + logout button
 */
@Component({
  selector: 'app-header-bar',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonChip, IonAvatar, IonLabel, IonButton
  ],
  styles: [`
    ion-chip { margin-right: 8px; }
    ion-avatar img { width: 100%; height: 100%; object-fit: cover; }
  `],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>

        <ion-title>{{ title }}</ion-title>

        <ion-buttons slot="end">
          <ng-container *ngIf="email$ | async as email">
            <ion-chip>
              <ion-avatar>
                <img [src]="avatarFor(email)" alt="avatar" />
              </ion-avatar>
              <ion-label>{{ email }}</ion-label>
            </ion-chip>
            <ion-button fill="clear" (click)="onLogout()">Logout</ion-button>
          </ng-container>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
  `
})
export class HeaderBarComponent {
  @Input() title = 'Dashboard';
  private store = inject(Store);
  email$ = this.store.select(AuthState.user).pipe(map(u => u?.email ?? ''));

  avatarFor(email: string) {
    const seed = encodeURIComponent(email || 'user');
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`;
  }

  onLogout() {
    this.store.dispatch(new Logout());
  }
}
