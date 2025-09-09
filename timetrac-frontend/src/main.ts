// src/main.ts

// Angular bootstrap APIs for standalone apps
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

// Router + HTTP (plus an interceptor to attach Authorization headers)
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// ✅ Ionic providers for standalone Angular (use this instead of IonicModule.forRoot)
import { provideIonicAngular } from '@ionic/angular/standalone';

// Ionicons: register the specific icons you reference in templates
import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';

//logout action icons
import { homeOutline, logOutOutline } from 'ionicons/icons';
addIcons({ homeOutline, logOutOutline });

// ⚙️ Register icons once before bootstrapping so <ion-icon name="..."> can resolve them
addIcons({ mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline });

// Root component & app routes
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Environment toggle (only meaningful if you actually build for prod;
// CLI optimizations already kick in on prod builds)
import { environment } from './environments/environment';

// Your HTTP interceptor (adds Authorization: Bearer <token>)
import { tokenInterceptor } from './app/core/token.interceptor';

// ✅ NGXS store (must be provided at bootstrap in standalone apps — there is no AppModule)
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { AuthState } from './app/state/auth.state';

// Enable Angular production mode if building with production environment
if (environment.production) {
  enableProdMode();
}

// 🚀 Bootstrap the standalone application
bootstrapApplication(AppComponent, {
  providers: [
    // Router configuration for the whole app
    provideRouter(routes),

    // HttpClient with your interceptor applied globally
    provideHttpClient(withInterceptors([tokenInterceptor])),

    // Ionic plumbing for standalone Angular (gestures, mode, etc.)
    provideIonicAngular(),

    // ✅ NGXS store and plugins — wrapped with importProvidersFrom to turn modules into providers
    importProvidersFrom(
      // Root store with your feature states
      NgxsModule.forRoot([AuthState], {
        developmentMode: !environment.production, // extra checks/logs in dev
      }),

      // Persist selected slices to localStorage; survive refresh
      // 🔧 Use "key" (singular). Can be string or string[].
      NgxsStoragePluginModule.forRoot({
        keys: ['auth'], // persist the 'auth' state
      }),
    ),
  ],
}).catch((err) => console.error(err));
