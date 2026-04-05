import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';

import { HomeComponent } from './home.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'epub-reader', loadChildren: () => import('./plugin-demos/epub-reader.module').then((m) => m.EpubReaderModule) },
  { path: 'nativescript-flitt', loadChildren: () => import('./plugin-demos/nativescript-flitt.module').then((m) => m.NativescriptFlittModule) },
  { path: 'nativescript-in-app-update', loadChildren: () => import('./plugin-demos/nativescript-in-app-update.module').then((m) => m.NativescriptInAppUpdateModule) },
  { path: 'pinia-persistedstate', loadChildren: () => import('./plugin-demos/pinia-persistedstate.module').then((m) => m.PiniaPersistedstateModule) },
];

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {}
