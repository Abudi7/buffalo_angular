// src/main.ts

// Angular bootstrap for standalone apps
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

// Router + HTTP (with global interceptor)
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// ✅ Ionic (standalone) — use this instead of IonicModule.forRoot()
import { provideIonicAngular } from '@ionic/angular/standalone';

// Ionicons: register icons *once* with kebab-case keys
import { addIcons } from 'ionicons';
import {
  // login
  mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline,
  // shell
  homeOutline, logOutOutline, globeOutline,
  // home page
  timeOutline, refreshOutline, playCircleOutline, stopCircleOutline,
  colorPaletteOutline, documentTextOutline,
} from 'ionicons/icons';

// Map kebab-case names → icon data
addIcons({
  'mail-outline': mailOutline,
  'lock-closed-outline': lockClosedOutline,
  'eye-outline': eyeOutline,
  'eye-off-outline': eyeOffOutline,

  'home-outline': homeOutline,
  'log-out-outline': logOutOutline,
  'globe-outline': globeOutline,

  'time-outline': timeOutline,
  'refresh-outline': refreshOutline,
  'play-circle-outline': playCircleOutline,
  'stop-circle-outline': stopCircleOutline,
  'color-palette-outline': colorPaletteOutline,
  'document-text-outline': documentTextOutline,
});

// Root component & routes
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Env
import { environment } from './environments/environment';

// Interceptor
import { tokenInterceptor } from './app/core/token.interceptor';

// NGXS
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { AuthState } from './app/state/auth.state';

if (environment.production) {
  enableProdMode();
}

// 🚀 Bootstrap app
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    // iOS look & feel
    provideIonicAngular({ mode: 'ios' }),
    importProvidersFrom(
      NgxsModule.forRoot([AuthState], {
        developmentMode: !environment.production,
      }),
      NgxsStoragePluginModule.forRoot({
        keys: ['auth'],
      }),
    ),
  ],
}).catch(err => console.error(err));
