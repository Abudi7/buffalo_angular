// src/app/app.component.ts
import { Component } from '@angular/core';
// ✅ Use the standalone variants
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  standalone: true,
  // Provide standalone Ionic components here
  imports: [IonApp, IonRouterOutlet],
  template: `
    <!-- Root ion-app lives ONLY here -->
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
})
export class AppComponent {}
