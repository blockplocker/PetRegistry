import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {provideTranslateService} from "@ngx-translate/core";
import {provideTranslateHttpLoader} from "@ngx-translate/http-loader";
import { routes } from './app.routes';
import { API_BASE_URL_PETREGISTRY, Client } from './domain/client';
import { environment } from '../environments/environment';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    provideTranslateService({
      loader: provideTranslateHttpLoader({prefix:'./i18n/', suffix:'.json'}),
      fallbackLang: 'en'
    }),
    Client,
    { provide: API_BASE_URL_PETREGISTRY, useValue: environment.API_URL },
  ],
};
