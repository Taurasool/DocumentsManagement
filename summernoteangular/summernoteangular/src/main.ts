

import { bootstrapApplication } from '@angular/platform-browser';
// Used to manually bootstrap the Angular application in a browser environment

import { provideRouter } from '@angular/router';
// Provides the router service along with the defined routes for navigation

import { provideHttpClient } from '@angular/common/http';
// Provides the HttpClient service for making HTTP requests (like fetching data from APIs)

import { AppComponent } from './app/app.component';
// This is the root component that starts the Angular application

import { routes } from './app/app.routes';
// This is the array of routes defined for navigation in the application

import { appConfig } from './app/app.config';
// This is the configuration object for the application (typically used with standalone components)

// Bootstrapping the Angular application manually
bootstrapApplication(AppComponent, {
  ...appConfig,               // Spread operator is used to include the application config settings

  providers: [
    provideRouter(routes),   // Provides the defined routes to enable routing in the app
    provideHttpClient()      // Enables HTTP functionality in the app (like API communication)
  ]
}).catch(err => console.error(err)); // If there's an error during bootstrapping, log it to the console


